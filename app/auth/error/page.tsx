import { Card, CardContent, Typography } from "@mui/material";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error | Boss Cargo Express",
};

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <Typography variant="body2" color="text.secondary">
          Code error: {params.error}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          An unspecified error occurred.
        </Typography>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Sorry, something went wrong.
              </Typography>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
