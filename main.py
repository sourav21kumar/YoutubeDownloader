import sys
import os
from pytube import YouTube
from dotenv import dotenv_values
# This will load the environment variables from the .env file in the root directory
config = dotenv_values(".env")



yt = YouTube(sys.argv[1])
def getEmbedUrl():
    yt = YouTube(sys.argv[1])
    # print('Ready to get Embed Url')
    embedurlvalue = yt.embed_url
    # ytstreams = yt.streams.filter(progressive=TRUE)
    # for res in ytstreams:
    #     print(res)
    # print(yt.streams)
    print(embedurlvalue)
    # print('Embed Url Fetching Successfull')
    return

def downloadFile(resolution, id):
    # yt = YouTube(sys.argv[1],on_progress_callback=on_progress)
    yt = YouTube(sys.argv[1])
    pathname = os.path.dirname(os.path.abspath(__file__))
    if resolution == 'Highest Quality':
        highest_stream = yt.streams.get_highest_resolution()
        highest_stream.download(output_path=fr'{pathname}/temp', filename= f'{id}.mp4') 

    elif resolution == 'Lowest Quality':
        lowest_stream = yt.streams.get_lowest_resolution()
        lowest_stream.download(output_path=fr'{pathname}/temp', filename= f'{id}.mp4') 

    else:
        audio_stream = yt.streams.get_audio_only()
        audio_stream.download(output_path=fr'{pathname}/temp', filename= f'{id}.mp3') 
    # stream.download(r'C:\Users\sourav\Downloads')
    # print(f'Youtube Video with {yt.title} downloaded Successfully')
    print(yt.title)
    # print(yt.thumbnail_url)
    return



    # Get the video embed url 
if sys.argv[2] == 'Embed Url':
        getEmbedUrl()

    #   Download the video
if sys.argv[2] == 'Download':
        downloadFile(sys.argv[3], sys.argv[4])  # Passing The Resolution of the Video

