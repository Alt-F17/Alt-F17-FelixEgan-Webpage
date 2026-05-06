import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layouts/MainLayout";
import WordJumble from "@/components/tools/WordJumble";
import Flashcards from "@/components/tools/Flashcards";
import ConceptTests from "@/components/tools/ConceptTests";
import PythonTerminal from "@/components/tools/PythonTerminal";
import AdditionalResources from "@/components/tools/AdditionalResources";
import SpotBug from "@/components/tools/SpotBug";
import StepByStepAnimator from "@/components/tools/StepByStepAnimator";
import StackOrQueue from "@/components/tools/StackOrQueue";
import SuperHardProblems from "@/components/tools/SuperHardProblems";
import { useToolsStore } from "@/store/toolsStore";
import PandasPlayground from "@/components/tools/PandasPlayground";
import PythonMindMap from "@/components/tools/PythonMindMap";
import ComplexityCalc from "@/components/tools/ComplexityCalc";
import OOPDiagram from "@/components/tools/OOPDiagram";

import wordJumbleData from "@/data/sf2/wordJumbleWords.json";
import flashcardsData from "@/data/sf2/flashcards.json";
import conceptTestsData from "@/data/sf2/conceptTests.json";
import spotBugData from "@/data/sf2/spotBugProblems.json";
import additionalResourcesData from "@/data/sf2/additionalResources.json";
import { superHardProblems } from "@/data/sf2/superHardProblems";

const SF2 = () => {
  const { activeTool, setActiveTool } = useToolsStore();

  const tools = useMemo(
    () => [
      { id: "word-jumble", name: "Word Jumble", component: () => <WordJumble data={wordJumbleData as any} /> },
      { id: "flashcards", name: "SF2 Flashcards", component: () => <Flashcards data={flashcardsData as any} /> },
      { id: "concept-test", name: "SF2 ConcepTests", component: () => <ConceptTests data={conceptTestsData as any} /> },
      { id: "stack-queue", name: "Stack or Queue?", component: StackOrQueue },
      { id: "pandas-playground", name: "Pandas and Matplotlib", component: PandasPlayground },
      { id: "spot-bug", name: "Spot the Bug", component: () => <SpotBug data={spotBugData as any} /> },
      { id: "list-pattern", name: "Final Boss Problems", component: () => <SuperHardProblems data={superHardProblems} /> },
      { id: "oop-diagram", name: "OOP Inheritance Diagram", component: OOPDiagram },
      { id: "sort-animator", name: "Step-by-Step Animator", component: StepByStepAnimator },
      { id: "complexity-calc", name: "Complexity Calculator", component: ComplexityCalc },
      { id: "py-terminal", name: "Python Terminal + File I/O", component: PythonTerminal },
      { id: "concept-map", name: "Python Concept Map", component: PythonMindMap },
      { id: "additional-resources", name: "A few more Tools...", component: () => <AdditionalResources data={additionalResourcesData as any} /> },
    ],
    []
  );

  useEffect(() => {
    if (activeTool && !tools.some((tool) => tool.id === activeTool)) {
      setActiveTool(null);
    }
  }, [activeTool, setActiveTool, tools]);

  const selectedTool = tools.find((tool) => tool.id === activeTool);
  const ToolComponent = selectedTool?.component || null;

  return (
    <MainLayout
      tools={tools}
      activeTool={activeTool}
      onToolSelect={(toolId) => setActiveTool(toolId)}
      title="SF2 Study Tools"
    >
      {!activeTool && (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-4xl font-bold mb-6">SF2 Study Tools</h1>
          <p className="text-xl text-gray-600 mb-8">Select a tool from the sidebar to get started</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {tools.slice(0, 6).map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveTool(tool.id)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-32">
                  <h2 className="font-medium text-lg">{tool.name}</h2>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTool && ToolComponent && <ToolComponent />}
    </MainLayout>
  );
};

export default SF2;


