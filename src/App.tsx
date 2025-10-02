import "./App.css";
import TipTapEditor from "./TipTap";

function App() {
  return (
    <div className="w-screen h-screen bg-neutral-900">
      <div className="p-4 flex flex-col gap-4">
        <h1 className="text-white">TipTap Editor Example</h1>
        <div className="bg-white p-4 rounded">
          <TipTapEditor />
        </div>
      </div>
    </div>
  );
}

export default App;
