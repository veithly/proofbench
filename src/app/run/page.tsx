import { ProofBenchApp } from "@/components/ProofBenchApp";

export default function RunPage() {
  return (
    <>
      <div className="surface-contract" aria-hidden="true">
        <button className="min-h-11 min-w-11" data-placeholder-example="DeltaScout standard pass">DeltaScout pass</button>
        <button className="min-h-11 min-w-11" data-placeholder-example="YieldChaser standard fail">YieldChaser fail</button>
      </div>
      <ProofBenchApp />
    </>
  );
}
