import type { PaymentMethod } from "@/db/purchases";

export const PAYMENT_METHODS: readonly { key: PaymentMethod; label: string }[] = [
  { key: "dinheiro", label: "Dinheiro" },
  { key: "debito", label: "Débito" },
  { key: "credito", label: "Crédito" },
  { key: "vale", label: "Vale-alimentação" },
];

export const paymentLabel = (key: PaymentMethod): string =>
  PAYMENT_METHODS.find((m) => m.key === key)?.label ?? key;
