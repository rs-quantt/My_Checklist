import { groq } from 'next-sanity';
import { client } from '../sanity/lib/client';
import { Rule } from '../types/rule';

export const getRules = async (): Promise<Rule[]> => {
  const query = groq`*[_type == "rule"]`;
  const rules = await client.fetch(query);
  return rules;
};

export const getRuleById = async (id: string): Promise<Rule | null> => {
  const query = groq`*[_type == "rule" && _id == $id][0] {
    ...,
    content[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "reference": @.reference->{
            _type,
            "slug": slug.current
          }
        }
      }
    }
  }`;
  const rule = await client.fetch(query, { id });
  return rule;
};
