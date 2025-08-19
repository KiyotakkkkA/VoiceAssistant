from typing import TypedDict, Required, NotRequired

class ToolServiceResponseType(TypedDict):
    status: Required[bool]
    message: Required[str]
    event: NotRequired[str | None]
    additional: NotRequired[dict | None]

class ProcessingServiceResponseType(TypedDict):
    original_text: Required[str]
    event: Required[str | None]
    intent: NotRequired[str | None]
    confidence: NotRequired[float]
    data: NotRequired[ToolServiceResponseType]

class RecognitionServiceResponseType(TypedDict):
    text: Required[str]
    original_text: NotRequired[str]

Message = TypedDict('Message', {
    'type': Required[str],
    'topic': Required[str],
    'payload': Required[RecognitionServiceResponseType],
    'from': NotRequired[str]
})