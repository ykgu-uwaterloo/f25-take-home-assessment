"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "./ui/textarea";

interface WeatherFormData {
  date: string;
  location: string;
  notes: string;
}

interface WeatherFormProps {
  onNewId: (id: string) => void;
}

function formatDateForDisplay(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateForAPI(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function isValidDate(
  date: Date | undefined,
  rawInput?: string
): "valid" | "invalid" | "future" {
  if (!date || isNaN(date.getTime())) return "invalid";

  if (rawInput) {
    const cleanInput = rawInput.trim().replace(/\s+/g, " ");

    // Strict MM/DD/YYYY or Month Day, Year like formats
    const dateRegex =
      /^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})$/i;
    if (!dateRegex.test(cleanInput)) return "invalid";
  }

  const now = new Date();
  if (date > now) return "future";

  return "valid";
}

export function WeatherForm({ onNewId }: WeatherFormProps) {
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; location?: string }>(
    {}
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    new Date()
  );
  const [displayValue, setDisplayValue] = useState(
    formatDateForDisplay(new Date())
  );

  const [formData, setFormData] = useState<WeatherFormData>({
    date: formatDateForAPI(new Date()),
    location: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  } | null>(null);

  function isFormValid() {
    return (
      isValidDate(selectedDate, displayValue) &&
      !errors.date &&
      !errors.location
    );
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setDisplayValue(formatDateForDisplay(date));
    const status = isValidDate(date);
    if (status === "invalid") {
      setErrors((prev) => ({ ...prev, date: "Please select a valid date." }));
    } else if (status === "future") {
      setErrors((prev) => ({ ...prev, date: "Date cannot be in the future." }));
    } else {
      setErrors((prev) => ({ ...prev, date: "" }));
      setFormData((prev) => ({
        ...prev,
        date: formatDateForAPI(date),
      }));
    }

    setCalendarOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "location") {
      const valid = /^[a-zA-Z\s,.'-]+$/.test(value.trim());
      setErrors((prev) => ({
        ...prev,
        location: valid
          ? ""
          : "Enter a valid city name (no symbols or numbers).",
      }));
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    const parsedDate = new Date(inputValue);
    const status = isValidDate(parsedDate, inputValue);

    if (status === "invalid") {
      setErrors((prev) => ({ ...prev, date: "Enter a valid calendar date." }));
    } else if (status === "future") {
      setErrors((prev) => ({ ...prev, date: "Date cannot be in the future." }));
    } else {
      setSelectedDate(parsedDate);
      setCalendarMonth(parsedDate);
      setFormData((prev) => ({
        ...prev,
        date: formatDateForAPI(parsedDate),
      }));
      setErrors((prev) => ({ ...prev, date: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    if (!isFormValid()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: "Weather request submitted successfully!",
          id: data.id,
        });
        onNewId(data.id);
        // Reset form after successful submission
        const today = new Date();
        setSelectedDate(today);
        setDisplayValue(formatDateForDisplay(today));
        setFormData({
          date: formatDateForAPI(today),
          location: "",
          notes: "",
        });
      } else {
        const errorData = await response.json();
        setResult({
          success: false,
          message: errorData.detail || "Failed to submit weather request",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Request</CardTitle>
        <CardDescription>
          Submit a weather data request for a specific location and date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Date
            </Label>
            <div className="relative flex gap-2">
              <Input
                id="date"
                value={displayValue}
                placeholder="Select a date"
                className={`bg-background pr-10 ${
                  errors.date ? "border-red-500" : ""
                }`}
                onChange={handleDateInputChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCalendarOpen(true);
                  }
                }}
                required
              />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date && (
              <p className="text-sm text-red-500 px-1">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., New York, London, Tokyo"
              value={formData.location}
              onChange={handleInputChange}
              className={errors.location ? "border-red-500" : ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any additional notes about this weather request..."
              value={formData.notes}
              onChange={handleInputChange}
            />
            {errors.location && (
              <p className="text-sm text-red-500 px-1">{errors.location}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid()}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit Weather Request"
            )}
          </Button>

          {result && (
            <div
              className={`p-3 rounded-md ${
                result.success
                  ? "bg-green-900/20 text-green-500 border border-green-500"
                  : "bg-red-900/20 text-red-500 border border-red-500"
              }`}
            >
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>{result.message}</span>
              </div>
              {result.success && result.id && (
                <>
                  <p className="text-xs mt-1">Your weather request ID:</p>

                  <div className="relative mt-1 flex items-center gap-2">
                    <div
                      className="flex-1 px-3 py-2 rounded-md text-sm text-green-400 font-mono cursor-pointer transition bg-muted hover:bg-green-900 border border-green-700"
                      onClick={() => {
                        navigator.clipboard.writeText(result.id!);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Click to copy"
                    >
                      {result.id}
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.id!);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Copy"
                      className="px-2 py-1 rounded-md bg-green-700 hover:bg-green-600 text-white text-xs transition"
                    >
                      Copy
                    </button>

                    {copied && (
                      <div className="absolute -top-7 left-0 text-xs text-white bg-green-600 px-2 py-1 rounded shadow">
                        Copied!
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
