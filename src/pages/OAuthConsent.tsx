import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Supabase OAuth consent screen (RFC 6749 authorization). Reached at
// /.lovable/oauth/consent?authorization_id=... after an OAuth client (e.g.
// ChatGPT, Claude) starts an authorization request against Supabase Auth.
export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const anySb = supabase.auth as any;
      const { data, error } = await anySb.oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const anySb = supabase.auth as any;
    const { data, error } = approve
      ? await anySb.oauth.approveAuthorization(authorizationId)
      : await anySb.oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="p-6 max-w-md w-full space-y-3">
          <h1 className="text-xl font-semibold text-destructive">Authorization error</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "An app";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="p-6 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-semibold">Connect {clientName}</h1>
        <p className="text-muted-foreground">
          {clientName} is requesting access to your FitTrack account. It will be able to
          read and write your workout data as you.
        </p>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Deny
          </Button>
        </div>
      </Card>
    </main>
  );
}
