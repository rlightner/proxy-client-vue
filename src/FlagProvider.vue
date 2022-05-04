<script lang="ts">
import { ref, onMounted, reactive, provide, PropType, toRefs, defineComponent, h, isVue2 } from 'vue-demi';
import { ContextStateSymbol, ContextUpdateSymbol } from './context';
import { UnleashClient, IConfig, IContext } from 'unleash-proxy-client';

type eventArgs = [Function, any]

export default defineComponent({
  name: 'FlagProvider',
  props: {
    // @ts-ignore
    config: { type: Object as PropType<IConfig>, required: true },
    unleashClient: { type: Object as PropType<UnleashClient> },
    startClient: { type: Boolean as PropType<boolean>, default: true }
  },
  setup(props) {
    const client = ref<UnleashClient | undefined>(props.unleashClient)
    const flagsReady = ref(false)
    const flagsError = ref(null)

    if (!props.config && !props.unleashClient) {
      console.warn(
        `You must provide either a config or an unleash client to the flag provider. If you are initializing the client in useEffect, you can avoid this warning by checking if the client exists before rendering.`
      )
    }

    if (!client.value && props.config) {
      client.value = new UnleashClient({
        url: props.config.url,
        clientKey: props.config.clientKey,
        appName: props.config.appName,
        environment: props.config.environment,
        disableRefresh: props.config.disableRefresh,
        refreshInterval: props.config.refreshInterval,
        metricsInterval: props.config.metricsInterval,
        disableMetrics: props.config.disableMetrics,
        storageProvider: props.config.storageProvider,
        context: props.config.context,
        fetch: props.config.fetch,
        bootstrap: props.config.bootstrap,
        bootstrapOverride: props.config.bootstrapOverride,
        headerName: props.config.headerName
      });
    }

    client.value?.on('ready', () => {
      flagsReady.value = true
    })

    client.value?.on('error', (e: any) => {
      flagsError.value = e
    })

    onMounted(() => {
      const shouldStartClient = props.startClient || !props.unleashClient
      if (shouldStartClient) client.value?.start()
    })

    const updateContext = async (context: IContext): Promise<void> => {
      await client.value?.updateContext(context)
    }

    const isEnabled = (name: string) => client.value?.isEnabled(name)
    const getVariant = (name: string) => client.value?.getVariant(name)
    const on = (event: string, ...args: eventArgs) => client.value?.on(event, ...args)

    const context = reactive({
      on,
      updateContext,
      isEnabled,
      getVariant,
      client,
      flagsReady,
      flagsError
    }) as { [key: string]: any }

    provide(ContextStateSymbol, toRefs(context))

    const update = (property: string, value: any) => {
      context[property] = value
    }

    provide(ContextUpdateSymbol, update)
  },
  render() {
    const defaultSlot = this.$slots.default

    let defaultContent

    if (typeof defaultSlot === 'function') {
      defaultContent = defaultSlot()
    } else {
      defaultContent = defaultSlot
    }

    return h('div', { ref: 'root' }, defaultContent)
  }
});
</script>