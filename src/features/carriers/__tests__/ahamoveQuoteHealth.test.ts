import { describe, expect, it } from 'vitest';
import {
  formatMissingQuoteFields,
  getAhamoveConnectionResultPresentation,
  getAhamoveQuoteHealthPresentation,
} from '../utils/ahamoveQuoteHealth';

describe('ahamoveQuoteHealth', () => {
  it('marks verified quotes as fully healthy', () => {
    expect(
      getAhamoveQuoteHealthPresentation({
        quoteReady: true,
        quoteVerified: true,
        missingQuoteFields: null,
      }),
    ).toEqual({
      label: 'Quote verified',
      helper: 'The latest backend check confirmed the provider can return a quote.',
      variant: 'success',
    });
  });

  it('shows missing quote fields when quote setup is incomplete', () => {
    expect(
      getAhamoveQuoteHealthPresentation({
        quoteReady: false,
        quoteVerified: false,
        missingQuoteFields: ['pickupAddress', 'defaultServiceCode'],
      }),
    ).toEqual({
      label: 'Quote setup incomplete',
      helper: 'Missing quote fields: pickupAddress, defaultServiceCode.',
      variant: 'warning',
    });
  });

  it('treats quoteReady=true and quoteVerified=false as ready but not failed', () => {
    expect(
      getAhamoveQuoteHealthPresentation({
        quoteReady: true,
        quoteVerified: false,
        missingQuoteFields: null,
      }),
    ).toEqual({
      label: 'Quote config ready',
      helper:
        'Required quote fields are present, but this response did not include a successful live quote check.',
      variant: 'info',
    });
  });

  it('summarizes successful connection checks without overstating quote success', () => {
    expect(
      getAhamoveConnectionResultPresentation({
        success: true,
        quoteReady: true,
        quoteVerified: false,
      }),
    ).toEqual({
      title: 'Connection succeeded, quote config ready',
      variant: 'info',
    });
  });

  it('formats missing quote fields as a short inline list', () => {
    expect(formatMissingQuoteFields([' pickupAddress ', '', 'defaultServiceCode'])).toBe(
      'pickupAddress, defaultServiceCode',
    );
  });
});
