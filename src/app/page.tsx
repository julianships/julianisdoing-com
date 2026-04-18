import { Suspense } from "react";
import { Typewriter } from "@/components/typewriter";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Typewriter />
    </Suspense>
  );
}
