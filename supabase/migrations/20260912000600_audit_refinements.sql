-- 0017 Audit refinements.
--
-- "Issued" is recorded only for the first draft → issued step. A later return
-- to an issued status (for example after a payment is removed) is a status
-- change, so a document's history reads the way it happened. Quotes get the
-- same distinction.

create or replace function private.audit_invoices()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_audit('invoice.created', 'invoice', new.id::text, '{}'::jsonb, new.client_id);
  elsif new.status is distinct from old.status then
    perform private.log_audit(
      case
        when old.status = 'draft' and new.status = 'issued' then 'invoice.issued'
        when new.status = 'void' then 'invoice.voided'
        when new.status = 'paid' then 'invoice.paid'
        else 'invoice.status_changed'
      end,
      'invoice', new.id::text,
      jsonb_build_object('number', new.number, 'from', old.status, 'to', new.status, 'total', new.total, 'currency', new.currency),
      new.client_id);
  end if;
  return new;
end; $$;

create or replace function private.audit_quotes()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.log_audit(
      case when old.status = 'draft' and new.status = 'sent' then 'quote.issued' else 'quote.status_changed' end,
      'quote', new.id::text,
      jsonb_build_object('number', new.number, 'from', old.status, 'to', new.status, 'total', new.total, 'currency', new.currency),
      new.client_id);
  end if;
  return new;
end; $$;
