import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layouts/MainLayout";
import WordJumble, { JumbleWord } from "@/components/tools/WordJumble";
import Flashcards, { Flashcard } from "@/components/tools/Flashcards";
import ConceptTests, { ConceptTest } from "@/components/tools/ConceptTests";
import AdditionalResources, { Resource } from "@/components/tools/AdditionalResources";
import SpotBug, { BugProblem } from "@/components/tools/SpotBug";
import { useToolsStore } from "@/store/toolsStore";
import BoxModelInteractive from "@/components/tools/BoxModelInteractive";
import EventListenerPlayground from "@/components/tools/EventListenerPlayground";
import HTTPRequestSimulator from "@/components/tools/HTTPRequestSimulator";
import CSSSpecificityWars from "@/components/tools/CSSSpecificityWars";
import Jinja2Preview from "@/components/tools/Jinja2Preview";
import HTTPStatusQuiz from "@/components/tools/HTTPStatusQuiz";
import GitStateVisualizer from "@/components/tools/GitStateVisualizer";

import wordJumbleData from "@/data/sf3/wordJumbleWords.json";
import flashcardsData from "@/data/sf3/flashcards.json";
import conceptTestsData from "@/data/sf3/conceptTests.json";
import spotBugData from "@/data/sf3/spotBugProblems.json";
import additionalResourcesData from "@/data/sf3/additionalResources.json";

const SF3 = () => {
  const { activeTool, setActiveTool } = useToolsStore();

  const tools = useMemo(
    () => [
      { id: "word-jumble", name: "Word Jumble", component: () => <WordJumble data={wordJumbleData as JumbleWord[]} /> },
      { id: "flashcards", name: "SF3 Flashcards", component: () => <Flashcards data={flashcardsData as Flashcard[]} /> },
      { id: "concept-test", name: "SF3 ConcepTests", component: () => <ConceptTests data={conceptTestsData as ConceptTest[]} /> },
      { id: "spot-bug", name: "Spot the Bug", component: () => <SpotBug data={spotBugData as BugProblem[]} /> },
      { id: "box-model", name: "Box Model Interactive", component: () => <BoxModelInteractive /> },
      { id: "event-listener", name: "Event Listener Playground", component: () => <EventListenerPlayground /> },
      { id: "http-sim", name: "HTTP Request Simulator", component: () => <HTTPRequestSimulator /> },
      { id: "specificity", name: "CSS Specificity Wars", component: () => <CSSSpecificityWars /> },
      { id: "jinja-preview", name: "Jinja2 Live Preview", component: () => <Jinja2Preview /> },
      { id: "http-quiz", name: "HTTP Status Quiz", component: () => <HTTPStatusQuiz /> },
      { id: "git-viz", name: "Git State Visualizer", component: () => <GitStateVisualizer /> },
      { id: "more-resources", name: "A few more tools...", component: () => <AdditionalResources data={additionalResourcesData as Resource[]} /> },
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
    <div className="theme-green">
      <MainLayout
        tools={tools}
        activeTool={activeTool}
        onToolSelect={(toolId) => setActiveTool(toolId)}
        title="SF3 Study Tools"
      >
        {!activeTool && (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-4xl font-bold mb-6">SF3 Study Tools</h1>
            <p className="text-xl text-gray-600 mb-8">Select a tool from the sidebar to get started</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
              {tools.map((tool) => (
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
    </div>
  );
};

export default SF3;
