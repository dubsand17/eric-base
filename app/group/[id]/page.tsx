import GroupDetailView from '@/components/features/posts/GroupDetailView'

interface GroupPageProps {
  params: { id: string }
}

export default function GroupPage({ params }: GroupPageProps) {
  return <GroupDetailView groupId={params.id} />
}
