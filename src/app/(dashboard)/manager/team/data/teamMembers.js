export const teamMembers = [
  {
    id: "EMP001",
    name: "Riya Sharma",
    designation: "Marketing Executive",
    status: "Active",
    workMode: "WFO",
    attendance: "Present",
  },
  {
    id: "EMP002",
    name: "Karan Mehta",
    designation: "Content Specialist",
    status: "On Leave",
    workMode: "WFH",
    attendance: "Leave",
  },
  {
    id: "EMP003",
    name: "Ananya Singh",
    designation: "SEO Analyst",
    status: "Active",
    workMode: "Hybrid",
    attendance: "Late",
  },
  {
    id: "EMP004",
    name: "Vikram Patel",
    designation: "Brand Designer",
    status: "Notice Period",
    workMode: "WFO",
    attendance: "Present",
  },
];

export const hierarchyMembers = [
  { id: "MGR001", name: "Aarav Verma", role: "Manager", level: 0 },
  { id: "EMP001", name: "Riya Sharma", role: "Marketing Executive", level: 1 },
  { id: "EMP002", name: "Karan Mehta", role: "Content Specialist", level: 1 },
  { id: "EMP003", name: "Ananya Singh", role: "SEO Analyst", level: 2 },
  { id: "EMP004", name: "Vikram Patel", role: "Brand Designer", level: 1 },
];

export const getTeamMemberById = (id) =>
  teamMembers.find((member) => member.id === id);
