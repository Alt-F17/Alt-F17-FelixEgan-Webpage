import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export interface Resource {
  title: string;
  url: string;
}

interface AdditionalResourcesProps {
  data: Resource[];
}

const toResourceHref = (url: string): string => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const normalized = url.startsWith("/") ? url.slice(1) : url;
  return `${import.meta.env.BASE_URL}${normalized}`;
};

const AdditionalResources: React.FC<AdditionalResourcesProps> = ({ data }) => {
  const resources = data;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>A Few More Resources...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">A few more tools to help you in your studies. Good luck with your exams!</p>
          <p className="text-sm text-muted-foreground">Resources open in a new tab to keep this page fast.</p>
        </CardContent>
      </Card>

      {resources.map((res, idx) => {
        const href = toResourceHref(res.url);
        return (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{res.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {href}
              </a>
              <Button asChild>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  Open Resource
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle>Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>A tool made by: Felix Egan (SF2 - W25)</li>
            <br />
            <b>Many thanks to:</b>
            <li>Eric Mayhew, Louisa Harutyunyan and Lei for their amazing teaching throughout semesters 1 and 2</li>
            <li>Louisa Harutyunyan for the original concepTests (idk if I'm allowed to keep those actually... oh well)</li>
            <li>Evan Luo for also sharing his notes!</li>
            <li>Do people actually read these credits?</li>
            <li>Ngl, without my coffee machine, this wouldn't work... Props to you coffee machine!</li>
            <li>Anyways, thanks for using this silly tool. If it breaks, blame the coffee machine.</li>
            <br />
            <Separator className="my-4" />
            I may (or may not) have burnt an unfathomable amount of unrecoverable hours of sleep making this...
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalResources;
