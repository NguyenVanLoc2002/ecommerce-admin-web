import type {
  MomoPaymentIntegration,
  PaypalPaymentIntegration,
  UpdateMomoPaymentIntegrationRequest,
  UpdatePaypalPaymentIntegrationRequest,
} from '../types/payment.types';
import type {
  MomoPaymentIntegrationFormValues,
  PaypalPaymentIntegrationFormValues,
} from '../schemas/paymentIntegrationSchema';

type DirtyFlags<T extends object> = Partial<Record<keyof T, boolean | undefined>>;

export function mapMomoIntegrationToFormValues(
  integration: MomoPaymentIntegration,
): MomoPaymentIntegrationFormValues {
  return {
    enabled: integration.enabled,
    environment: integration.environment ?? '',
    partnerCode: '',
    clearPartnerCode: false,
    accessKey: '',
    clearAccessKey: false,
    secretKey: '',
    clearSecretKey: false,
    createUrl: integration.createUrl ?? '',
    redirectUrl: integration.redirectUrl ?? '',
    ipnUrl: integration.ipnUrl ?? '',
    requestType: integration.requestType ?? '',
    lang: integration.lang ?? '',
    connectTimeoutMs:
      integration.connectTimeoutMs == null ? '' : String(integration.connectTimeoutMs),
    readTimeoutMs: integration.readTimeoutMs == null ? '' : String(integration.readTimeoutMs),
  };
}

export function mapPaypalIntegrationToFormValues(
  integration: PaypalPaymentIntegration,
): PaypalPaymentIntegrationFormValues {
  return {
    enabled: integration.enabled,
    environment: integration.environment ?? '',
    clientId: '',
    clearClientId: false,
    clientSecret: '',
    clearClientSecret: false,
    baseUrl: integration.baseUrl ?? '',
    returnUrl: integration.returnUrl ?? '',
    cancelUrl: integration.cancelUrl ?? '',
    webhookId: integration.webhookId ?? '',
    currency: integration.currency ?? '',
    brandName: integration.brandName ?? '',
    locale: integration.locale ?? '',
    userAction: integration.userAction ?? '',
    paymentMethodPreference: integration.paymentMethodPreference ?? '',
    shippingPreference: integration.shippingPreference ?? '',
    testConversionEnabled: integration.testConversionEnabled,
    testConversionRateVndToUsd:
      integration.testConversionRateVndToUsd == null
        ? ''
        : String(integration.testConversionRateVndToUsd),
    connectTimeoutMs:
      integration.connectTimeoutMs == null ? '' : String(integration.connectTimeoutMs),
    readTimeoutMs: integration.readTimeoutMs == null ? '' : String(integration.readTimeoutMs),
  };
}

export function buildMomoIntegrationPayload(
  values: MomoPaymentIntegrationFormValues,
  dirtyFields: DirtyFlags<MomoPaymentIntegrationFormValues>,
): UpdateMomoPaymentIntegrationRequest {
  const payload: UpdateMomoPaymentIntegrationRequest = {};

  assignIfDirty(payload, dirtyFields, 'enabled', values.enabled);
  assignIfDirty(payload, dirtyFields, 'environment', values.environment);
  assignIfDirty(payload, dirtyFields, 'createUrl', values.createUrl);
  assignIfDirty(payload, dirtyFields, 'redirectUrl', values.redirectUrl);
  assignIfDirty(payload, dirtyFields, 'ipnUrl', values.ipnUrl);
  assignIfDirty(payload, dirtyFields, 'requestType', values.requestType);
  assignIfDirty(payload, dirtyFields, 'lang', values.lang);
  assignIfDirty(payload, dirtyFields, 'connectTimeoutMs', toNullableNumber(values.connectTimeoutMs));
  assignIfDirty(payload, dirtyFields, 'readTimeoutMs', toNullableNumber(values.readTimeoutMs));

  assignSecret(payload, values, dirtyFields, 'partnerCode', 'clearPartnerCode');
  assignSecret(payload, values, dirtyFields, 'accessKey', 'clearAccessKey');
  assignSecret(payload, values, dirtyFields, 'secretKey', 'clearSecretKey');

  return payload;
}

export function buildPaypalIntegrationPayload(
  values: PaypalPaymentIntegrationFormValues,
  dirtyFields: DirtyFlags<PaypalPaymentIntegrationFormValues>,
): UpdatePaypalPaymentIntegrationRequest {
  const payload: UpdatePaypalPaymentIntegrationRequest = {};

  assignIfDirty(payload, dirtyFields, 'enabled', values.enabled);
  assignIfDirty(payload, dirtyFields, 'environment', values.environment);
  assignIfDirty(payload, dirtyFields, 'baseUrl', values.baseUrl);
  assignIfDirty(payload, dirtyFields, 'returnUrl', values.returnUrl);
  assignIfDirty(payload, dirtyFields, 'cancelUrl', values.cancelUrl);
  assignIfDirty(payload, dirtyFields, 'webhookId', values.webhookId);
  assignIfDirty(payload, dirtyFields, 'currency', values.currency);
  assignIfDirty(payload, dirtyFields, 'brandName', values.brandName);
  assignIfDirty(payload, dirtyFields, 'locale', values.locale);
  assignIfDirty(payload, dirtyFields, 'userAction', values.userAction);
  assignIfDirty(payload, dirtyFields, 'paymentMethodPreference', values.paymentMethodPreference);
  assignIfDirty(payload, dirtyFields, 'shippingPreference', values.shippingPreference);
  assignIfDirty(payload, dirtyFields, 'testConversionEnabled', values.testConversionEnabled);
  assignIfDirty(
    payload,
    dirtyFields,
    'testConversionRateVndToUsd',
    toNullableNumber(values.testConversionRateVndToUsd),
  );
  assignIfDirty(payload, dirtyFields, 'connectTimeoutMs', toNullableNumber(values.connectTimeoutMs));
  assignIfDirty(payload, dirtyFields, 'readTimeoutMs', toNullableNumber(values.readTimeoutMs));

  assignSecret(payload, values, dirtyFields, 'clientId', 'clearClientId');
  assignSecret(payload, values, dirtyFields, 'clientSecret', 'clearClientSecret');

  return payload;
}

function assignIfDirty<
  TPayload extends object,
  TValues extends object,
  TKey extends keyof TPayload & keyof TValues,
>(
  payload: TPayload,
  dirtyFields: DirtyFlags<TValues>,
  key: TKey,
  value: TPayload[TKey],
) {
  if (!dirtyFields[key]) {
    return;
  }

  payload[key] = value;
}

function assignSecret<
  TPayload extends object,
  TValues extends object,
  TSecretKey extends keyof TPayload & keyof TValues,
  TClearKey extends keyof TValues,
>(
  payload: TPayload,
  values: TValues,
  dirtyFields: DirtyFlags<TValues>,
  secretKey: TSecretKey,
  clearKey: TClearKey,
) {
  const secretValue = values[secretKey];
  const clearValue = values[clearKey];

  if (clearValue === true) {
    payload[secretKey] = '' as TPayload[TSecretKey];
    return;
  }

  if (!dirtyFields[secretKey]) {
    return;
  }

  if (typeof secretValue === 'string' && secretValue !== '') {
    payload[secretKey] = secretValue as TPayload[TSecretKey];
  }
}

function toNullableNumber(value: string): number | null {
  return value === '' ? null : Number(value);
}
