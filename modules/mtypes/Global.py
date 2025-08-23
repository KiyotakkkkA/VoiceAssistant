from typing import TypedDict, Required, NotRequired

class RecognitionServiceResponseType(TypedDict):
    text: Required[str]

Message = TypedDict('Message', {
    'type': Required[str],
    'topic': Required[str],
    'payload': Required[RecognitionServiceResponseType],
    'from': NotRequired[str]
})