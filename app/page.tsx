import CardInterface from "@/components/CardInterface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            AI Card Explorer
          </h1>
          <p className="text-muted-foreground text-lg">Ask questions and explore different AI perspectives</p>
        </div>
        <CardInterface />
      </div>
    </main>
  );
}
