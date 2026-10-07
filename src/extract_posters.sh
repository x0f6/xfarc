#!/bin/bash
export LC_ALL=C
export LANG=C
export LC_NUMERIC=C

mkdir -p posters

for video in *.mp4; do
    name=$(basename "$video" .mp4)
    duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")

    if [ -z "$duration" ]; then
        echo "✗ Impossible de lire la durée de $video"
        continue
    fi

    best_score=-1
    best_time=""

    for pct in 0.3 0.5 0.7; do
        t=$(awk -v d="$duration" -v p="$pct" 'BEGIN { printf "%.3f", d * p }')

        ffmpeg -y -ss "$t" -i "$video" -vframes 1 -vf "format=yuvj420p" /tmp/candidate.jpg -loglevel error

        stats=$(ffmpeg -i /tmp/candidate.jpg -vf "signalstats,metadata=print:file=-" -f null - 2>/dev/null)
        avg=$(echo "$stats" | grep -o "YAVG=[0-9.]*" | head -1 | cut -d= -f2)
        ymin=$(echo "$stats" | grep -o "YMIN=[0-9.]*" | head -1 | cut -d= -f2)
        ymax=$(echo "$stats" | grep -o "YMAX=[0-9.]*" | head -1 | cut -d= -f2)

        if [ -n "$avg" ]; then
            valid=$(awk -v a="$avg" 'BEGIN { print (a > 15 && a < 245) ? 1 : 0 }')
            if [ "$valid" = "1" ]; then
                contrast=$(awk -v mx="$ymax" -v mn="$ymin" 'BEGIN { printf "%.3f", mx - mn }')
                better=$(awk -v c="$contrast" -v b="$best_score" 'BEGIN { print (c > b) ? 1 : 0 }')
                if [ "$better" = "1" ]; then
                    best_score="$contrast"
                    best_time="$t"
                fi
            fi
        fi
    done

    if [ -z "$best_time" ]; then
        best_time=$(awk -v d="$duration" 'BEGIN { printf "%.3f", d / 2 }')
    fi

    ffmpeg -y -ss "$best_time" -i "$video" -vframes 1 -vf "format=yuvj420p" -q:v 2 "posters/${name}.jpg" -loglevel error
    echo "✓ $name (frame à ${best_time}s, contraste≈${best_score})"
done

rm -f /tmp/candidate.jpg