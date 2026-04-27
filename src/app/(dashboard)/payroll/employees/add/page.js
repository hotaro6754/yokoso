'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayrollAddEmployeePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/payroll/employees');
  }, [router]);

  return null;
}
