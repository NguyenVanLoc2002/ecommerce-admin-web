type QuoteHealthVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface QuoteHealthInput {
  quoteReady?: boolean | null;
  quoteVerified?: boolean | null;
  missingQuoteFields?: string[] | null;
}

interface QuoteHealthPresentation {
  label: string;
  helper: string;
  variant: QuoteHealthVariant;
}

export interface ConnectionResultPresentation {
  title: string;
  variant: QuoteHealthVariant;
}

export function normalizeMissingQuoteFields(fields: string[] | null | undefined) {
  return (fields ?? []).map((field) => field.trim()).filter(Boolean);
}

export function formatMissingQuoteFields(fields: string[] | null | undefined) {
  const normalizedFields = normalizeMissingQuoteFields(fields);
  if (!normalizedFields.length) {
    return null;
  }

  return normalizedFields.join(', ');
}

export function getAhamoveQuoteHealthPresentation({
  quoteReady,
  quoteVerified,
  missingQuoteFields,
}: QuoteHealthInput): QuoteHealthPresentation {
  const missingSummary = formatMissingQuoteFields(missingQuoteFields);

  if (quoteVerified === true) {
    return {
      label: 'Quote verified',
      helper: 'The latest backend check confirmed the provider can return a quote.',
      variant: 'success',
    };
  }

  if (quoteReady === false) {
    return {
      label: 'Quote setup incomplete',
      helper: missingSummary
        ? `Missing quote fields: ${missingSummary}.`
        : 'The backend reports this config is not ready to return quotes.',
      variant: 'warning',
    };
  }

  if (quoteReady === true) {
    return {
      label: 'Quote config ready',
      helper:
        quoteVerified === false
          ? 'Required quote fields are present, but this response did not include a successful live quote check.'
          : 'Required quote fields are present. Run a quote test to verify the provider response.',
      variant: 'info',
    };
  }

  return {
    label: 'Quote status unknown',
    helper: 'Run a backend health check to refresh quote readiness.',
    variant: 'default',
  };
}

export function getAhamoveConnectionResultPresentation({
  success,
  quoteReady,
  quoteVerified,
}: {
  success: boolean;
  quoteReady?: boolean | null;
  quoteVerified?: boolean | null;
}): ConnectionResultPresentation {
  if (!success) {
    return {
      title: 'Connection failed',
      variant: 'danger',
    };
  }

  if (quoteVerified === true) {
    return {
      title: 'Quote test succeeded',
      variant: 'success',
    };
  }

  if (quoteReady === false) {
    return {
      title: 'Connection succeeded, quote setup incomplete',
      variant: 'warning',
    };
  }

  if (quoteReady === true) {
    return {
      title: 'Connection succeeded, quote config ready',
      variant: 'info',
    };
  }

  return {
    title: 'Connection succeeded',
    variant: 'success',
  };
}
