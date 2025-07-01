import { WindowProviderResponseEnums } from '@multiversx/sdk-web-wallet-cross-window-provider/out/enums';
import { ReplyWithPostMessageType } from '@multiversx/sdk-web-wallet-cross-window-provider/out/types';

interface BaseType {
  postMessageData: ReplyWithPostMessageType;
}

interface IframeReplyType extends BaseType {
  target: HTMLIFrameElement;
  callbackUrl?: never;
}

interface OpenerReplyType extends BaseType {
  target: Window;
  callbackUrl: string;
}

type ReplyWithPostMessageJoinedType = IframeReplyType | OpenerReplyType;

export const replyWithPostMessage = ({
  postMessageData: props,
  callbackUrl,
  target
}: ReplyWithPostMessageJoinedType): void => {
  if (typeof props.payload.data === 'undefined') {
    console.error('Unable to sign transaction', props.payload.error);
    return;
  }

  const data = props.payload.data;

  const isIframe = target instanceof HTMLIFrameElement;

  if (isIframe) {
    const { contentWindow } = target;

    if (contentWindow) {
      const currentIframeHref = new URL(target.src);
      const iframeOrigin = currentIframeHref.origin;

      contentWindow.postMessage(
        {
          type: props.type,
          payload: {
            data
          }
        },
        iframeOrigin
      );
    }
    return;
  }

  const allowedResponses = [
    WindowProviderResponseEnums.handshakeResponse,
    WindowProviderResponseEnums.cancelResponse,
    WindowProviderResponseEnums.disconnectResponse
  ];

  const origin = allowedResponses.includes(props.type)
    ? '*'
    : String(callbackUrl);

  target.postMessage(
    {
      type: props.type,
      payload: {
        data
      }
    },
    origin
  );
};
