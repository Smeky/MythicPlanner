import os
from PIL import Image

# Cut out the mob's portrait from the game
# It was either this or figure out how to make addons in WoW - and honestly, screw that

for filename in os.listdir('./source'):
    print(filename)
    img = Image.open('./source/' + filename)
    # cropped = img.crop((1714, 888, 1842, 1013))
    cropped = img.crop((1757, 935, 1885, 1060))
    cropped.save('./result/' + filename)
