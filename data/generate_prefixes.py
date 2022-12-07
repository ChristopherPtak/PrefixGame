
from argparse import ArgumentParser

import json

from collections import defaultdict
from tqdm import tqdm


parser = ArgumentParser()
parser.add_argument('infile', metavar='DICTIONARY', help='JSON dictionary file')
parser.add_argument('-o', dest='outfile', metavar='OUTFILE', default='prefixes.json', help='Prefix group file')

opts = parser.parse_args()


# Read dictionary
with open(opts.infile, 'r') as f:
    dictionary = json.load(f)

# Calculate the set of all words longer than 3 letters
long_words = set(word for word in dictionary['words'] if len(word) > 3)

# Group words by prefix
prefix_groups = defaultdict(lambda: set())
for word in tqdm(long_words):
    prefix = word[:3]
    prefix_groups[prefix].add(word)

# Remove prefix groups with less than 20 words
filtered_prefix_groups = {}
for (prefix, words) in tqdm(prefix_groups.items()):
    if len(words) >= 20:
        filtered_prefix_groups[prefix] = list(words)

# Write result
with open(opts.outfile, 'w') as f:
    json.dump(filtered_prefix_groups, f)

