
"use client"

import { ProfileSectionFormPage } from '@/components/profile-section-form-page';
import { useParams } from 'next/navigation';

export default function EditEmploymentPage() {
    const params = useParams();
    const id = params.id as string;
    return <ProfileSectionFormPage section="employment" itemId={id} />;
}
