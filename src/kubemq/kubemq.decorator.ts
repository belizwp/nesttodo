export const SUBSCRIBER_MAP = new Map<string, (message: string) => void>();
export const SUBSCRIBER_OBJECT_MAP = new Map();

export function SubscribeTo(channel: string): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = target[propertyKey];
    SUBSCRIBER_MAP.set(channel, originalMethod);
    return descriptor;
  };
}
