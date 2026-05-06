import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const openSF1Tools = () => {
    window.location.href = `${import.meta.env.BASE_URL}sf1/sf1-study-tools.html`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            SF-Study-Tools
          </h1>
          <p className="text-2xl text-muted-foreground font-light">
            Random tools that Felix made instead of sleeping...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-sky-400 h-full flex flex-col" onClick={openSF1Tools}>
            <CardHeader>
              <CardTitle className="text-2xl text-sky-600">SF1</CardTitle>
              <CardDescription>Introduction to Programming</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                Basic Python, Logic, and Algorithms.
              </p>
              <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white">Open SF1 Tools</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-blue-600 h-full flex flex-col" onClick={() => navigate("/sf2")}>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">SF2</CardTitle>
              <CardDescription>Data Structures & Algorithms</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                OOP, Complexity, Stacks, Queues, and more.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Open SF2 Tools</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-emerald-600 h-full flex flex-col" onClick={() => navigate("/sf3")}>
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-700">SF3</CardTitle>
              <CardDescription>Program Development in a Graphical Environment</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                Javascript, HTML, CSS and Flask.
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Open SF3 Tools</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
