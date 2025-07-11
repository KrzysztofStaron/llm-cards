import CardInterface from "@/components/CardInterface";

export default function Home() {
  return (
    <main
      className="min-h-screen h-screen bg-black text-green-400 overflow-hidden"
      style={{ fontFamily: "Courier New, Monaco, Menlo, Ubuntu Mono, monospace" }}
    >
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-2 tracking-wider matrix-glow">
            &gt; AI_TERMINAL.sh
          </h1>
          <p className="text-green-500/80 text-sm tracking-wide animate-pulse">[NEURAL_NETWORK_INTERFACE_ACTIVE]</p>
          <div className="mt-2 text-green-700/60 text-xs">&gt; System ready for neural input processing...</div>
        </div>
        <CardInterface />
      </div>
    </main>
  );
}
