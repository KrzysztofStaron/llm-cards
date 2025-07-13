import CardInterface from "@/components/CardInterface";

export default function Home() {
  return (
    <main
      className="min-h-screen h-screen bg-black text-green-400 overflow-hidden"
      style={{ fontFamily: "Courier New, Monaco, Menlo, Ubuntu Mono, monospace" }}
    >
      <div className="container mx-auto px-4 py-2 md:py-4 max-w-4xl h-full flex flex-col">
        <div className="text-center mb-4 md:mb-6 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-400 mb-2 tracking-wider matrix-glow">
            &gt; AI_TERMINAL.sh
          </h1>
          <p className="text-green-500/80 text-sm tracking-wide animate-pulse">[NEURAL_NETWORK_INTERFACE_ACTIVE]</p>
        </div>
        <div className="flex-1 min-h-0">
          <CardInterface />
        </div>
      </div>
    </main>
  );
}
