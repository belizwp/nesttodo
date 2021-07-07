import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Config, EventStoreType, EventsStoreClient, EventsStoreSubscriptionRequest, EventsStoreMessage, Utils } from 'kubemq-js'
import { SUBSCRIBER_MAP, SUBSCRIBER_OBJECT_MAP } from './kubemq.decorator'

@Injectable()
export class KubemqService implements OnModuleInit, OnModuleDestroy {
  protected logger = new Logger(KubemqService.name, true)
  private eventsClient: EventsStoreClient
  private isEnable: boolean
  private group: string

  constructor(private configService: ConfigService) {
    this.isEnable = this.configService.get('kubemq.isEnable')
    this.group = this.configService.get('kubemq.group')
  }

  async onModuleInit() {
    if (!this.isEnable) {
      return
    }
    const opts: Config = {
      address: this.configService.get('kubemq.address'),
      clientId: Utils.uuid(),
    }
    this.eventsClient = new EventsStoreClient(opts)
    SUBSCRIBER_MAP.forEach((functionRef, channel) => {
      this.subscribe(channel)
    })
  }

  async onModuleDestroy() {
    if (!this.isEnable) {
      return
    }
    await this.eventsClient.close()
  }

  async publish(channel: string, message: string): Promise<void> {
    if (!this.isEnable) {
      return
    }
    const eventsMessage: EventsStoreMessage = {
      channel: channel,
      body: Utils.stringToBytes(message),
    }
    await this.eventsClient.send(eventsMessage)
  }

  private async subscribe(channel: string): Promise<void> {
    const subRequest: EventsStoreSubscriptionRequest = {
      channel: channel,
      group: this.group,
      clientId: Utils.uuid(),
      requestType: EventStoreType.StartFromFirst,
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
