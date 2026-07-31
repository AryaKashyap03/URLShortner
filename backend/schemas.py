from pydantic import BaseModel, ConfigDict, HttpUrl


class URLCreate(BaseModel):
    original_url : HttpUrl

class URLResponse(BaseModel):
    original_url: HttpUrl
    short_token: str
    clicks: int

    model_config = ConfigDict(from_attributes=True)

class URLUpdate(BaseModel):
    original_url: HttpUrl