"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RiStarFill } from "@remixicon/react";
import { useId, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { XIcon } from "lucide-react";

export default function StarComponet({
    name, 
    rating, 
    isEditing,
    onRatingChange,
    OnDelete
  }: {
    name: string;
    rating: number;
    isEditing: boolean;
    onRatingChange: (rating: string) => void;
    OnDelete: () => void;
  }) {
  const id = useId();
  const [hoverRating, setHoverRating] = useState("");
  const [currentRating, setCurrentRating] = useState<string>(rating.toString());

  const handleRatingChange = (value: string) => {
    setCurrentRating(value);
    onRatingChange(value);
  };

  return (
    <Card className="w-full h-fit relative">
        <CardHeader>
            <legend className="text-foreground text-sm leading-none font-medium">
                {name}
                <Button
                variant="ghost"
                className={`${isEditing ? 'absolute' : 'hidden'} top-0 right-0 hover:text-red-700`}
                onClick={OnDelete}
                >
                    <XIcon />
                </Button>
            </legend>
        </CardHeader>
        <CardContent>
            <RadioGroup className="inline-flex gap-0" onValueChange={(e) => {
                if(!isEditing) return;
                handleRatingChange(e);
            }}>
                {["1", "2", "3", "4", "5"].map((value) => (
                <label
                    key={value}
                    className={`group focus-within:border-ring focus-within:ring-ring/50 relative rounded p-0.5 outline-none focus-within:ring-[3px] ${isEditing ? 'cursor-pointer' : ''}`}
                    onMouseEnter={() => isEditing && setHoverRating(value)}
                    onMouseLeave={() => isEditing && setHoverRating("")}
                >
                    <RadioGroupItem id={`${id}-${value}`} value={value} className="sr-only" />
                    <RiStarFill
                    size={24}
                    className={`transition-all ${
                        (hoverRating || currentRating) >= value ? "text-amber-500" : "text-input"
                    } ${isEditing ? 'group-hover:scale-110' : '' }`}
                    />
                    <span className="sr-only">
                    {value} star{value === "1" ? "" : "s"}
                    </span>
                </label>
                ))}
            </RadioGroup>
        </CardContent>
    </Card>
  );
}
