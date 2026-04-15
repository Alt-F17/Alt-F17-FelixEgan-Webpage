import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PythonTerminal: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Python Terminal Emulator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Practice basic Python commands in a simulated terminal. (You don't need to sign in btw, ignore that)
        </p>

        <p className="mb-2">Here are a few File I/O challenges you can do if you want to practice open():</p>
        <ul className="list-disc list-inside mb-6">
          <li>
            Take the spotting data from <b>spottings.txt</b> and send them to a <b>JSON</b> file called <b>spottings.json</b>
            (watch out for multiple occurances!)
          </li>
          <li>
            Create a function that prints all the odd numbers in <b>range(int(input('range: ')))</b> and appends them to
            a log using <b>open("log.txt", "a")</b> like this: "<b>n</b>th odd number: <b>odd_n</b>".
          </li>
          <li>
            <b>Try</b> to open a file called <b>books.txt</b> and read its contents, or create it if it does not exist,
            filling it with the contents from <b>sample.txt</b>.
          </li>
        </ul>

        <div className="rounded-lg border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">The terminal now opens in a new tab to avoid iframe overhead.</p>
          <Button asChild>
            <a href="https://trinket.io/embed/python/ba9ed90b3fe1" target="_blank" rel="noopener noreferrer">
              Open Python Terminal
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PythonTerminal;
