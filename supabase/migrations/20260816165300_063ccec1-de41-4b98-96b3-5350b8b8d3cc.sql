
-- ENUMS
CREATE TYPE public.work_status AS ENUM ('planned','in_progress','delayed','completed');
CREATE TYPE public.complaint_type AS ENUM ('overcharging','delay_quality');
CREATE TYPE public.complaint_status AS ENUM ('submitted','under_review','action_taken','resolved','rejected');
CREATE TYPE public.app_role AS ENUM ('citizen','dept_officer','collector','admin');

-- REFERENCE TABLES
CREATE TABLE public.districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_hi text NOT NULL
);
GRANT SELECT ON public.districts TO anon, authenticated;
GRANT ALL ON public.districts TO service_role;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "districts_public_read" ON public.districts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_hi text NOT NULL
);
GRANT SELECT ON public.departments TO anon, authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_public_read" ON public.departments FOR SELECT TO anon, authenticated USING (true);

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  district_id uuid REFERENCES public.districts(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_official(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('dept_officer','collector','admin'))
$$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- WORKS
CREATE TABLE public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title_en text NOT NULL,
  title_hi text NOT NULL,
  description_en text,
  description_hi text,
  department_id uuid NOT NULL REFERENCES public.departments(id),
  district_id uuid NOT NULL REFERENCES public.districts(id),
  block text,
  village text,
  sanctioned_amount numeric(14,2) NOT NULL CHECK (sanctioned_amount >= 0),
  spent_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
  govt_order_no text NOT NULL,
  govt_order_url text,
  contractor_name text,
  contractor_contact text,
  start_date date,
  deadline date,
  completed_on date,
  status public.work_status NOT NULL DEFAULT 'planned',
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.works TO anon, authenticated;
GRANT INSERT, UPDATE ON public.works TO authenticated;
GRANT ALL ON public.works TO service_role;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "works_public_read" ON public.works FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "works_official_write" ON public.works FOR ALL TO authenticated USING (public.is_official(auth.uid())) WITH CHECK (public.is_official(auth.uid()));
CREATE INDEX works_district_idx ON public.works(district_id);
CREATE INDEX works_department_idx ON public.works(department_id);
CREATE INDEX works_status_idx ON public.works(status);

-- AUDIT LOG
CREATE TABLE public.work_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  field text NOT NULL,
  old_value text,
  new_value text,
  changed_by uuid,
  changed_by_name text,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.work_audit_log TO anon, authenticated;
GRANT ALL ON public.work_audit_log TO service_role;
ALTER TABLE public.work_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_public_read" ON public.work_audit_log FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.log_work_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE editor text;
BEGIN
  SELECT COALESCE(full_name, 'Official') INTO editor FROM public.profiles WHERE id = auth.uid();
  IF NEW.sanctioned_amount IS DISTINCT FROM OLD.sanctioned_amount THEN
    INSERT INTO public.work_audit_log(work_id, field, old_value, new_value, changed_by, changed_by_name)
    VALUES (NEW.id, 'sanctioned_amount', OLD.sanctioned_amount::text, NEW.sanctioned_amount::text, auth.uid(), editor);
  END IF;
  IF NEW.spent_amount IS DISTINCT FROM OLD.spent_amount THEN
    INSERT INTO public.work_audit_log(work_id, field, old_value, new_value, changed_by, changed_by_name)
    VALUES (NEW.id, 'spent_amount', OLD.spent_amount::text, NEW.spent_amount::text, auth.uid(), editor);
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.work_audit_log(work_id, field, old_value, new_value, changed_by, changed_by_name)
    VALUES (NEW.id, 'status', OLD.status::text, NEW.status::text, auth.uid(), editor);
  END IF;
  IF NEW.deadline IS DISTINCT FROM OLD.deadline THEN
    INSERT INTO public.work_audit_log(work_id, field, old_value, new_value, changed_by, changed_by_name)
    VALUES (NEW.id, 'deadline', OLD.deadline::text, NEW.deadline::text, auth.uid(), editor);
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END; $$;
CREATE TRIGGER works_audit BEFORE UPDATE ON public.works
FOR EACH ROW EXECUTE FUNCTION public.log_work_changes();

-- COMPLAINTS (no citizen identity stored here => publicly readable)
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_no text UNIQUE NOT NULL,
  work_id uuid REFERENCES public.works(id) ON DELETE SET NULL,
  type public.complaint_type NOT NULL,
  amount_demanded numeric(14,2),
  accused_name text,
  accused_designation text,
  incident_date date,
  description text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  overcharge_alert boolean NOT NULL DEFAULT false,
  escalation_level smallint NOT NULL DEFAULT 1,
  last_action_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaints TO anon, authenticated;
GRANT UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints_public_read" ON public.complaints FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "complaints_public_insert" ON public.complaints FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "complaints_official_update" ON public.complaints FOR UPDATE TO authenticated USING (public.is_official(auth.uid())) WITH CHECK (public.is_official(auth.uid()));
CREATE INDEX complaints_work_idx ON public.complaints(work_id);

CREATE SEQUENCE public.complaint_seq START 1001;
CREATE OR REPLACE FUNCTION public.prepare_complaint()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sanctioned numeric;
BEGIN
  NEW.tracking_no := 'MPT-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.complaint_seq')::text, 6, '0');
  NEW.status := 'submitted';
  NEW.escalation_level := 1;
  NEW.last_action_at := now();
  IF NEW.type = 'overcharging' AND NEW.work_id IS NOT NULL AND NEW.amount_demanded IS NOT NULL THEN
    SELECT sanctioned_amount INTO sanctioned FROM public.works WHERE id = NEW.work_id;
    IF sanctioned IS NOT NULL AND NEW.amount_demanded > 0 THEN
      NEW.overcharge_alert := true;
      IF NEW.amount_demanded > sanctioned THEN NEW.escalation_level := 2; END IF;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER complaints_prepare BEFORE INSERT ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.prepare_complaint();

-- PRIVATE FILER LINK
CREATE TABLE public.complaint_filers (
  complaint_id uuid PRIMARY KEY REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_filers TO authenticated;
GRANT ALL ON public.complaint_filers TO service_role;
ALTER TABLE public.complaint_filers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "filers_self_read" ON public.complaint_filers FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "filers_self_insert" ON public.complaint_filers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- EVIDENCE
CREATE TABLE public.complaint_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_evidence TO anon, authenticated;
GRANT ALL ON public.complaint_evidence TO service_role;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence_insert" ON public.complaint_evidence FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "evidence_official_read" ON public.complaint_evidence FOR SELECT TO authenticated USING (public.is_official(auth.uid()));

-- PUBLIC ACTION LOG
CREATE TABLE public.complaint_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_role text NOT NULL,
  actor_name text,
  action text NOT NULL,
  reason text NOT NULL,
  escalation_level smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.complaint_actions TO anon, authenticated;
GRANT INSERT ON public.complaint_actions TO authenticated;
GRANT ALL ON public.complaint_actions TO service_role;
ALTER TABLE public.complaint_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "actions_public_read" ON public.complaint_actions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "actions_official_insert" ON public.complaint_actions FOR INSERT TO authenticated WITH CHECK (public.is_official(auth.uid()));

-- ESCALATION ENGINE
CREATE OR REPLACE FUNCTION public.run_escalations()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE moved integer := 0; r record; target smallint;
BEGIN
  FOR r IN SELECT * FROM public.complaints WHERE status IN ('submitted','under_review') AND escalation_level < 4 LOOP
    target := r.escalation_level;
    IF now() - r.last_action_at > interval '30 days' THEN target := 4;
    ELSIF now() - r.last_action_at > interval '15 days' THEN target := greatest(r.escalation_level, 3::smallint);
    ELSIF now() - r.last_action_at > interval '7 days' THEN target := greatest(r.escalation_level, 2::smallint);
    END IF;
    IF target > r.escalation_level THEN
      UPDATE public.complaints SET escalation_level = target WHERE id = r.id;
      INSERT INTO public.complaint_actions(complaint_id, actor_role, actor_name, action, reason, escalation_level)
      VALUES (r.id, 'system', 'Auto-escalation', 'escalated', 'No response received within the mandated time limit.', target);
      moved := moved + 1;
    END IF;
  END LOOP;
  RETURN moved;
END; $$;

CREATE OR REPLACE FUNCTION public.mark_overdue_works()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.works SET status = 'delayed'
  WHERE deadline < current_date AND status IN ('planned','in_progress');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END; $$;

-- SEED DATA
INSERT INTO public.districts (code, name_en, name_hi) VALUES
 ('BPL','Bhopal','भोपाल'),('IND','Indore','इंदौर'),('JBP','Jabalpur','जबलपुर'),
 ('GWL','Gwalior','ग्वालियर'),('REW','Rewa','रीवा'),('SGR','Sagar','सागर'),
 ('UJN','Ujjain','उज्जैन'),('BTL','Betul','बैतूल');

INSERT INTO public.departments (code, name_en, name_hi) VALUES
 ('PWD','Public Works Department','लोक निर्माण विभाग'),
 ('MC','Municipal Corporation','नगर निगम'),
 ('WRD','Water Resources Department','जल संसाधन विभाग'),
 ('PRD','Panchayat & Rural Development','पंचायत एवं ग्रामीण विकास'),
 ('PHE','Public Health Engineering','लोक स्वास्थ्य यांत्रिकी'),
 ('EDU','School Education','स्कूल शिक्षा विभाग'),
 ('HLT','Public Health & Family Welfare','लोक स्वास्थ्य एवं परिवार कल्याण');

INSERT INTO public.works (code,title_en,title_hi,description_en,description_hi,department_id,district_id,block,village,sanctioned_amount,spent_amount,govt_order_no,govt_order_url,contractor_name,contractor_contact,start_date,deadline,completed_on,status,lat,lng)
SELECT v.code,v.te,v.th,v.de,v.dh,d.id,dist.id,v.block,v.village,v.sanc,v.spent,v.go,v.gourl,v.cn,v.cc,v.sd::date,v.dl::date,v.co::date,v.st::public.work_status,v.lat,v.lng
FROM (VALUES
 ('MP-PWD-0001','Widening of Kolar Road (Phase II)','कोलार रोड चौड़ीकरण (चरण II)','4-lane widening of 6.2 km stretch including drainage.','6.2 किमी मार्ग का चार लेन चौड़ीकरण एवं नाली निर्माण।','PWD','BPL','Huzur','Kolar',248500000,131200000,'PWD/BPL/2024/1187','https://govtorders.mp.gov.in/PWD-BPL-2024-1187.pdf','Shrinath Infrastructure Pvt Ltd','+91 755 240 1188','2024-07-15','2026-06-30',NULL,'in_progress',23.1793,77.4126),
 ('MP-MC-0002','Streetlight repair, Ward 42','वार्ड 42 में स्ट्रीट लाइट मरम्मत','Replacement of 84 non-functional LED streetlights.','84 खराब एलईडी स्ट्रीट लाइटों का प्रतिस्थापन।','MC','BPL','Bairagarh','Ward 42',412000,412000,'BMC/EL/2025/0442','https://govtorders.mp.gov.in/BMC-EL-2025-0442.pdf','Deep Electricals','+91 98260 11223','2025-11-02','2025-12-15','2025-12-11','completed',23.2769,77.3413),
 ('MP-PHE-0003','Hand pump installation, Semra village','सेमरा गाँव में हैंडपंप स्थापना','Installation of 6 India Mark-II hand pumps.','6 इंडिया मार्क-II हैंडपंपों की स्थापना।','PHE','BTL','Ghoradongri','Semra',684000,180000,'PHE/BTL/2025/0091','https://govtorders.mp.gov.in/PHE-BTL-2025-0091.pdf','Narmada Borewells','+91 94250 88771','2025-09-01','2026-01-31',NULL,'delayed',22.0574,77.9006),
 ('MP-WRD-0004','Narmada canal lining, Sanawad branch','नर्मदा नहर लाइनिंग, सनावद शाखा','Concrete lining of 11 km distributary canal.','11 किमी वितरिका नहर की कंक्रीट लाइनिंग।','WRD','IND','Depalpur','Sanawad',97400000,42800000,'WRD/IND/2024/0765','https://govtorders.mp.gov.in/WRD-IND-2024-0765.pdf','Maa Ahilya Constructions','+91 731 255 9080','2024-11-20','2026-03-31',NULL,'in_progress',22.7196,75.8577),
 ('MP-EDU-0005','New higher secondary school building','नवीन उच्चतर माध्यमिक विद्यालय भवन','12-classroom building with laboratory and toilets.','प्रयोगशाला एवं शौचालय सहित 12 कक्ष भवन।','EDU','REW','Sirmour','Baikunthpur',38600000,9100000,'EDU/REW/2025/0233','https://govtorders.mp.gov.in/EDU-REW-2025-0233.pdf','Vindhya Builders','+91 7662 24 5511','2025-02-10','2026-05-31',NULL,'in_progress',24.5373,81.3042),
 ('MP-HLT-0006','Upgrade of Community Health Centre','सामुदायिक स्वास्थ्य केंद्र उन्नयन','30-bed upgrade with oxygen plant.','ऑक्सीजन प्लांट सहित 30 बिस्तरीय उन्नयन।','HLT','JBP','Patan','Patan',52300000,52300000,'HLT/JBP/2023/0512','https://govtorders.mp.gov.in/HLT-JBP-2023-0512.pdf','Kalchuri Healthcare Infra','+91 761 240 7766','2023-08-01','2025-03-31','2025-03-20','completed',23.2856,79.6871),
 ('MP-PRD-0007','Drain cleaning, Gram Panchayat Tigra','ग्राम पंचायत टिगरा में नाली सफाई','Desilting of 3.4 km village drains before monsoon.','मानसून पूर्व 3.4 किमी ग्राम नालियों की सफाई।','PRD','GWL','Morar','Tigra',235000,60000,'PRD/GWL/2026/0018','https://govtorders.mp.gov.in/PRD-GWL-2026-0018.pdf','Gram Seva Samiti','+91 90980 33445','2026-04-01','2026-06-15',NULL,'planned',26.1450,78.1642),
 ('MP-PWD-0008','Reconstruction of Bina river bridge','बीना नदी पुल पुनर्निर्माण','120 m RCC bridge with approach roads.','अप्रोच रोड सहित 120 मीटर आरसीसी पुल।','PWD','SGR','Khurai','Bina',176900000,88400000,'PWD/SGR/2024/0902','https://govtorders.mp.gov.in/PWD-SGR-2024-0902.pdf','Bundelkhand Infra Ltd','+91 7582 22 3311','2024-05-05','2026-02-28',NULL,'delayed',23.8388,78.7378),
 ('MP-MC-0009','Solid waste transfer station','ठोस अपशिष्ट स्थानांतरण केंद्र','New 60 TPD transfer station with weighbridge.','धर्मकांटा सहित नवीन 60 टीपीडी केंद्र।','MC','UJN','Ujjain City','Nagziri',64200000,20500000,'UMC/SWM/2025/0157','https://govtorders.mp.gov.in/UMC-SWM-2025-0157.pdf','Kshipra Enviro Services','+91 734 251 4400','2025-06-18','2026-09-30',NULL,'in_progress',23.1765,75.7885),
 ('MP-WRD-0010','Repair of Bansagar feeder channel','बाणसागर फीडर चैनल मरम्मत','Breach repair and embankment strengthening.','दरार मरम्मत एवं तटबंध सुदृढ़ीकरण।','WRD','REW','Rewa','Gurh',28700000,26900000,'WRD/REW/2025/0388','https://govtorders.mp.gov.in/WRD-REW-2025-0388.pdf','Sone Valley Works','+91 7662 25 6677','2025-01-12','2025-10-31',NULL,'delayed',24.4991,81.6790),
 ('MP-PRD-0011','CC road construction, Piplani village','पिपलानी गाँव में सीसी रोड निर्माction','1.1 km cement concrete village road.','1.1 किमी सीमेंट कंक्रीट ग्रामीण सड़क।','PRD','BTL','Multai','Piplani',4850000,1200000,'PRD/BTL/2025/0244','https://govtorders.mp.gov.in/PRD-BTL-2025-0244.pdf','Satpura Roadways Const.','+91 94254 77889','2025-12-01','2026-07-31',NULL,'in_progress',21.7745,78.2540),
 ('MP-PHE-0012','Piped water supply scheme, Mahidpur','महिदपुर नल-जल योजना','Household tap connections for 1,240 homes.','1,240 घरों हेतु नल कनेक्शन।','PHE','UJN','Mahidpur','Mahidpur Rural',91500000,33700000,'PHE/UJN/2024/0611','https://govtorders.mp.gov.in/PHE-UJN-2024-0611.pdf','Jal Dhara Projects','+91 734 252 9911','2024-09-09','2026-08-31',NULL,'in_progress',23.4890,75.6120)
) AS v(code,te,th,de,dh,dept,dcode,block,village,sanc,spent,go,gourl,cn,cc,sd,dl,co,st,lat,lng)
JOIN public.departments d ON d.code = v.dept
JOIN public.districts dist ON dist.code = v.dcode;

INSERT INTO public.complaints (work_id, type, amount_demanded, accused_name, accused_designation, incident_date, description, is_anonymous)
SELECT w.id, 'overcharging', 25000, 'Site Supervisor (name withheld)', 'Sub-Engineer', current_date - 12,
 'Demanded Rs 25,000 in cash from villagers to install the hand pump that is already fully sanctioned and paid for by the government.', true
FROM public.works w WHERE w.code = 'MP-PHE-0003';

INSERT INTO public.complaints (work_id, type, incident_date, description, is_anonymous)
SELECT w.id, 'delay_quality', current_date - 30,
 'Bridge work has been stalled for four months. Approach road is broken and unsafe for school children.', false
FROM public.works w WHERE w.code = 'MP-PWD-0008';
