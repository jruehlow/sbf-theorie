import os
import re
import json
from io import BytesIO
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag, NavigableString
from PIL import Image


def scrape_category(license_key, category, page_url, questions):
    # prepare media directory for this license/category
    media_dir = os.path.join("media", license_key, category)
    os.makedirs(media_dir, exist_ok=True)

    # fetch & parse
    resp = requests.get(page_url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    content = soup.find("div", id="content")
    if content is None:
        return

    # for each question separator
    for sep in content.find_all("p", class_="line"):
        # find the very next <p> as question text
        question_p = None
        for sib in sep.next_siblings:
            if isinstance(sib, NavigableString):
                if not sib.strip():
                    continue
            if isinstance(sib, Tag) and sib.name == "p":
                question_p = sib
            break
        if not question_p:
            continue

        # extract raw text & question number
        raw = question_p.get_text(" ", strip=True)
        m = re.match(r"^\s*(\d+)\.\s*(.*)", raw)
        if m:
            qnum = int(m.group(1))
            question_text = m.group(2)
        else:
            qnum = len(questions) + 1
            question_text = raw

        # look for inline <img> in that <p>
        img_src = None
        inline = question_p.find("img")
        if inline:
            img_src = inline["src"]

        # scan forward siblings until the <ol> for an <ol> and a fallback <img>
        ol = None
        for sib in question_p.next_siblings:
            if isinstance(sib, Tag) and sib.name == "ol" and \
               "elwisOL-lowerLiteral" in sib.get("class", []):
                ol = sib
                break
            if img_src is None and isinstance(sib, Tag):
                found = sib.find("img")
                if found:
                    img_src = found["src"]

        if ol is None:
            continue

        # clean up question text
        if img_src:
            question_text = re.sub(r"\(\s*\)\s*", "", question_text)
        question_text = re.sub(r"\s+", " ", question_text).strip()
        question_text = re.sub(r"\s+([?.!,;:])", r"\1", question_text)
        if not question_text.endswith("?"):
            question_text += "?"

        # extract four options
        opts = [li.get_text(" ", strip=True)
                for li in ol.find_all("li", limit=4)]

        # download & convert image
        image_path = None
        if img_src:
            full_url = urljoin(page_url, img_src)
            r2 = requests.get(full_url)
            r2.raise_for_status()
            im = Image.open(BytesIO(r2.content)).convert("RGB")
            img_name = f"question{qnum}.webp"
            image_path = os.path.join(media_dir, img_name)
            im.save(image_path, "WEBP")
            # make path JSON‐friendly (posix style)
            image_path = image_path.replace(os.sep, "/")

        # assemble question dict
        questions.append({
            "license":  license_key,
            "category": category,
            "question": question_text,
            "option1":  opts[0] if len(opts) > 0 else "",
            "option2":  opts[1] if len(opts) > 1 else "",
            "option3":  opts[2] if len(opts) > 2 else "",
            "option4":  opts[3] if len(opts) > 3 else "",
            "image":    image_path
        })


def main():
    tasks = [
        ("sbf-binnen", "basisfragen",
         "https://www.elwis.de/DE/Sportschifffahrt/Sportbootfuehrerscheine/Fragenkatalog-Binnen/Basisfragen/Basisfragen-node.html"),
        ("sbf-binnen", "fragen-binnen",
         "https://www.elwis.de/DE/Sportschifffahrt/Sportbootfuehrerscheine/Fragenkatalog-Binnen/Spezifische-Fragen-Binnen/Spezifische-Fragen-Binnen-node.html"),
        ("sbf-binnen", "fragen-segeln",
         "https://www.elwis.de/DE/Sportschifffahrt/Sportbootfuehrerscheine/Fragenkatalog-Binnen/Spezifische-Fragen-Segeln/Spezifische-Fragen-Segeln-node.html"),
    ]

    all_questions = []
    for license_key, category, url in tasks:
        scrape_category(license_key, category, url, all_questions)

    with open("questions.json", "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)

    print(f"Scraped {len(all_questions)} questions.")
    print("Saved images under media/<license>/<category>/")


if __name__ == "__main__":
    main()
