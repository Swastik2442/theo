import { db } from "~/server/db";

const mockURLs = [
  "https://utfs.io/f/0591c940-a64f-48e1-bdff-2dc6b0e089ac-2alj.jpg",
  "https://utfs.io/f/4303553f-d75a-4cb5-985a-f13e4ad3ddb5-278l.jpg",
];

const mockImages = mockURLs.map((url, index) => ({
  id: index + 1,
  url,
}));

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log(posts);
  
  return (
    <main className="black">
      <div className="flex flex-wrap gap-4">
        {[...mockImages, ...mockImages, ...mockImages, ...mockImages, ...mockImages, ...mockImages].map((image) => (
          <div key={image.id} className="w-48">
            <img src={image.url} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {posts.map((post) => (
          <div key={post.id} className="w-48">
            <p>{post.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
