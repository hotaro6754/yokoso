'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PayrollEmployeeDocumentsPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const id = params?.id;
    router.replace(id ? `/payroll/employees/${id}` : '/payroll/employees');
  }, [params, router]);

  return null;
}
