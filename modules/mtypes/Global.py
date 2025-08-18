from typing import TypedDict, Required, NotRequired

class ToolServiceResponse(TypedDict):
    status: Required[bool]
    message: Required[str]
    event: NotRequired[str]
    additional: NotRequired[dict]