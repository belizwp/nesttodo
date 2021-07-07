import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { Utils, EventsClient, Config, EventsMessage } from 'kubemq-js'

import { SUBSCRIBER_MAP, SUBSCRIBER_OBJECT_MAP } from './kubemq.decorator'

@Injectable()
export class KubemqService implements OnModuleInit, OnModuleDestroy {
  protected logger = new Logger(KubemqService.name, true)
  private eventsClient: EventsClient

  async onModuleInit() {
    const opts: Config = {
      address: 'localhost:50000',
      clientId: Utils.uuid(),
    }
    this.eventsClient = new EventsClient(opts)
    SUBSCRIBER_MAP.forEach((functionRef, channel) => {
      this.subscribe(channel)
    })
  }

  async onModuleDestroy() {
    await this.eventsClient.close()
  }

  async publish(channel: string, message: string): Promise<void> {
    const eventsMessage: EventsMessage = {
      channel: channel,
      body: Utils.stringToBytes(message),
    }
    await this.eventsClient.send(eventsMessage)
  }

  private async subscribe(channel: string): Promise<void> {
    const subRequest = {
      channel: channel,
    }
    await this.eventsClient
      .subscribe(subRequest, async (err, msg) => {
        if (err) {
          this.logger.error(err)
          return
        }
        if (msg) {
          const body: string = Utils.bytesToString(msg.body)
          const objectRef = SUBSCRIBER_OBJECT_MAP.get(channel)
          const callback = SUBSCRIBER_MAP.get(channel)
          await callback.apply(objectRef, [body])
        }
      })
      .catch((reason) => {
        this.logger.error(reason)
      })
    this.logger.log(`'${channel}' subscriber has started`)
  }

  subscribeToResponseOf<T>(topic: string, instance: T): void {
    SUBSCRIBER_OBJECT_MAP.set(topic, instance)
  }

  pingCheck() {
    return this.eventsClient.ping()
  }
}
