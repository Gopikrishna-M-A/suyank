import CreatePostForm from "./_components/CreatePost";

export const runtime = "edge";

export default function CreatePostPage() {
  return (
    <main className="container py-4 flex flex-col items-center">
      <h4 className="text-2xl mb-8">Write post</h4>
      <CreatePostForm />
    </main>
  );
}
