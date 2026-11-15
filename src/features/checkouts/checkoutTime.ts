export type CheckoutDateTimeParts = {
  date: string;
  time: string;
};

export function splitCheckoutTimestamp(value: string): CheckoutDateTimeParts {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return { date: "", time: "" };
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return {
    date: `${timestamp.getFullYear()}-${pad(timestamp.getMonth() + 1)}-${pad(timestamp.getDate())}`,
    time: `${pad(timestamp.getHours())}:${pad(timestamp.getMinutes())}`,
  };
}

export function joinCheckoutTimestamp(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

export function formatCheckoutDate(value: string): string {
  const timestamp = new Date(value);

  return Number.isNaN(timestamp.getTime())
    ? value
    : timestamp.toLocaleDateString();
}

export function formatCheckoutTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  const timestamp = new Date(value);

  return Number.isNaN(timestamp.getTime())
    ? value
    : timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
