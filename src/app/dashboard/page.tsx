"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObjectId } from "mongodb";

function formatTimestamp(value: unknown) {
  if (!value) return "—";
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default function DashboardPage() {
  const [visitors, setVisitors] = useState<Array<Record<string, unknown>>>([]);
  const [ipGroups, setIpGroups] = useState<
    Array<{
      ip: string;
      count: number;
      latestVisit: string;
      url: string;
    }>
  >([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [expandedIp, setExpandedIp] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetch("/api/visitors")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load visitors");
        const data = await response.json();
        if (!active) return;

        const records = (data.visitors ?? []) as Array<Record<string, unknown>>;
        setVisitors(records);

        const grouped = new Map<
          string,
          { count: number; latestVisit: string; url: string }
        >();

        for (const visitor of records) {
          const ip = typeof visitor.ip === "string" ? visitor.ip : "unknown";
          const current = grouped.get(ip) ?? {
            count: 0,
            latestVisit: "",
            url: "",
          };
          current.count += 1;
          const receivedAt =
            typeof visitor.receivedAt === "string" ? visitor.receivedAt : "";
          if (!current.latestVisit || receivedAt > current.latestVisit) {
            current.latestVisit = receivedAt;
          }
          const href = typeof visitor.href === "string" ? visitor.href : "";
          if (!current.url && href) current.url = href;
          grouped.set(ip, current);
        }

        setIpGroups(
          Array.from(grouped.entries())
            .map(([ip, data]) => ({
              ip,
              count: data.count,
              latestVisit: data.latestVisit,
              url: data.url,
            }))
            .sort((a, b) => b.count - a.count),
        );
      })
      .catch((error) => {
        if (!active) return;
        setDbError(
          error instanceof Error
            ? error.message
            : "Failed to load visitor data",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const matchingVisits = useMemo(() => {
    if (!expandedIp) return [];
    return visitors.filter((visitor) => {
      const ip = typeof visitor.ip === "string" ? visitor.ip : "unknown";
      return ip === expandedIp;
    });
  }, [expandedIp, visitors]);

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Visitor intelligence
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Visitor dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Every visit is captured with the IP, location, browser details,
            referrer, and a precise timestamp.
          </p>
        </div>

        {dbError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle>Database connection issue</CardTitle>
              <CardDescription>{dbError}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The dashboard is ready, but it could not load visitor records
                yet. Once MongoDB is reachable, the table will populate
                automatically.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total visits</CardTitle>
              <CardDescription>Visitors stored in MongoDB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{visitors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Latest visit</CardTitle>
              <CardDescription>Most recent capture time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {formatTimestamp(visitors[0]?.receivedAt)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tracked details</CardTitle>
              <CardDescription>
                Includes network + browser context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                IP, country, city, region, timezone, language, screen size,
                referrer
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-xl font-semibold">IP activity overview</h2>
            <p className="text-sm text-muted-foreground">
              Each row shows a visitor IP, how many times it has visited, the
              latest visit time, and the latest URL. Click details to inspect
              every visit from that IP.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead>Visit URL</TableHead>
                <TableHead className="w-[120px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ipGroups.map((row) => {
                const matchingVisits = visitors.filter((visitor) => {
                  const ip =
                    typeof visitor.ip === "string" ? visitor.ip : "unknown";
                  return ip === row.ip;
                });

                return (
                  <>
                    <TableRow key={row.ip}>
                      <TableCell className="font-medium">{row.ip}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell>{formatTimestamp(row.latestVisit)}</TableCell>
                      <TableCell className="max-w-[280px] truncate">
                        {row.url || "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedIp(expandedIp === row.ip ? null : row.ip)
                          }
                        >
                          {expandedIp === row.ip ? "Hide" : "Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedIp === row.ip && matchingVisits.length > 0 ? (
                      <TableRow key={`${row.ip}-details`}>
                        <TableCell colSpan={5} className="bg-muted/20 p-4">
                          <div className="flex flex-col gap-3">
                            <div className="text-sm font-semibold">
                              All visits from {row.ip}
                            </div>
                            {matchingVisits.map((visit) => (
                              <div
                                key={(visit._id as ObjectId).toString()}
                                className="rounded-lg border border-border bg-background p-3"
                              >
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  {formatTimestamp(visit.receivedAt)}
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  {Object.entries(visit).map(([key, value]) => {
                                    if (key === "_id") return null;
                                    return (
                                      <div key={key} className="text-sm">
                                        <span className="font-medium text-foreground">
                                          {key}:
                                        </span>{" "}
                                        <span className="text-muted-foreground">
                                          {formatValue(value)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
