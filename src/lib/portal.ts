import { supabase } from "@/integrations/supabase/client";

export type WorkStatus = "planned" | "in_progress" | "delayed" | "completed";
export type ComplaintType = "overcharging" | "delay_quality";
export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "action_taken"
  | "resolved"
  | "rejected";

export type District = { id: string; code: string; name_en: string; name_hi: string };
export type Department = { id: string; code: string; name_en: string; name_hi: string };

export type Work = {
  id: string;
  code: string;
  title_en: string;
  title_hi: string;
  description_en: string | null;
  description_hi: string | null;
  department_id: string;
  district_id: string;
  block: string | null;
  village: string | null;
  sanctioned_amount: number;
  spent_amount: number;
  govt_order_no: string;
  govt_order_url: string | null;
  contractor_name: string | null;
  contractor_contact: string | null;
  start_date: string | null;
  deadline: string | null;
  completed_on: string | null;
  status: WorkStatus;
  lat: number | null;
  lng: number | null;
  districts?: District | null;
  departments?: Department | null;
};

export type Complaint = {
  id: string;
  tracking_no: string;
  work_id: string | null;
  type: ComplaintType;
  amount_demanded: number | null;
  accused_name: string | null;
  accused_designation: string | null;
  incident_date: string | null;
  description: string;
  is_anonymous: boolean;
  status: ComplaintStatus;
  overcharge_alert: boolean;
  escalation_level: number;
  created_at: string;
  last_action_at: string;
};

export type ComplaintAction = {
  id: string;
  complaint_id: string;
  actor_role: string;
  actor_name: string | null;
  action: string;
  reason: string;
  escalation_level: number | null;
  created_at: string;
};

export type AuditEntry = {
  id: string;
  work_id: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  changed_by_name: string | null;
  reason: string | null;
  changed_at: string;
};

const WORK_SELECT =
  "*, districts:district_id(id,code,name_en,name_hi), departments:department_id(id,code,name_en,name_hi)";

export async function fetchWorks(): Promise<Work[]> {
  const { data, error } = await supabase
    .from("works")
    .select(WORK_SELECT)
    .order("sanctioned_amount", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Work[];
}

export async function fetchWorkByCode(code: string): Promise<Work | null> {
  const { data, error } = await supabase
    .from("works")
    .select(WORK_SELECT)
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Work) ?? null;
}

export async function fetchDistricts(): Promise<District[]> {
  const { data, error } = await supabase.from("districts").select("*").order("name_en");
  if (error) throw error;
  return (data ?? []) as District[];
}

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from("departments").select("*").order("name_en");
  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Complaint[];
}

export async function fetchComplaintsForWork(workId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("work_id", workId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Complaint[];
}

export async function fetchAuditLog(workId: string): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from("work_audit_log")
    .select("*")
    .eq("work_id", workId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AuditEntry[];
}

export async function fetchComplaintByTracking(
  trackingNo: string,
): Promise<{ complaint: Complaint; actions: ComplaintAction[]; work: Work | null } | null> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("tracking_no", trackingNo.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const complaint = data as Complaint;

  const [{ data: actions }, workRes] = await Promise.all([
    supabase
      .from("complaint_actions")
      .select("*")
      .eq("complaint_id", complaint.id)
      .order("created_at", { ascending: true }),
    complaint.work_id
      ? supabase.from("works").select(WORK_SELECT).eq("id", complaint.work_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    complaint,
    actions: (actions ?? []) as ComplaintAction[],
    work: (workRes.data as unknown as Work) ?? null,
  };
}

export type NewComplaint = {
  workId: string | null;
  type: ComplaintType;
  amountDemanded: number | null;
  accusedName: string | null;
  accusedDesignation: string | null;
  incidentDate: string | null;
  description: string;
  isAnonymous: boolean;
  contactPhone: string | null;
  files: File[];
};

export async function submitComplaint(input: NewComplaint): Promise<Complaint> {
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      work_id: input.workId,
      type: input.type,
      amount_demanded: input.amountDemanded,
      accused_name: input.accusedName,
      accused_designation: input.accusedDesignation,
      incident_date: input.incidentDate,
      description: input.description,
      is_anonymous: input.isAnonymous,
      tracking_no: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  const complaint = data as Complaint;

  for (const file of input.files) {
    const path = `${complaint.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const upload = await supabase.storage.from("complaint-evidence").upload(path, file);
    if (!upload.error) {
      await supabase.from("complaint_evidence").insert({
        complaint_id: complaint.id,
        file_path: path,
        kind: file.type.split("/")[0] || "file",
      });
    }
  }

  if (!input.isAnonymous) {
    const { data: session } = await supabase.auth.getUser();
    if (session.user) {
      await supabase.from("complaint_filers").insert({
        complaint_id: complaint.id,
        user_id: session.user.id,
        contact_phone: input.contactPhone,
      });
    }
  }

  return complaint;
}
