function normalizeReference(str) {
    // Trim and collapse whitespace
    //
    str = str.trim().replace(/\s+/g, ' ');

    // In node v10 'ẞ'.toLowerCase() === 'Ṿ', which is presumed to be a bug
    // fixed in v12 (couldn't find any details).
    //
    // So treat this one as a special case
    // (remove this when node v10 is no longer supported).
    //
    if ('ẞ'.toLowerCase() === 'Ṿ') {
        str = str.replace(/ẞ/g, 'ß');
    }

    // .toLowerCase().toUpperCase() should get rid of all differences
    // between letter variants.
    //
    // Simple .toLowerCase() doesn't normalize 125 code points correctly,
    // and .toUpperCase doesn't normalize 6 of them (list of exceptions:
    // İ, ϴ, ẞ, Ω, K, Å - those are already uppercased, but have differently
    // uppercased versions).
    //
    // Here's an example showing how it happens. Lets take greek letter omega:
    // uppercase U+0398 (Θ), U+03f4 (ϴ) and lowercase U+03b8 (θ), U+03d1 (ϑ)
    //
    // Unicode entries:
    // 0398;GREEK CAPITAL LETTER THETA;Lu;0;L;;;;;N;;;;03B8;
    // 03B8;GREEK SMALL LETTER THETA;Ll;0;L;;;;;N;;;0398;;0398
    // 03D1;GREEK THETA SYMBOL;Ll;0;L;<compat> 03B8;;;;N;GREEK SMALL LETTER SCRIPT THETA;;0398;;0398
    // 03F4;GREEK CAPITAL THETA SYMBOL;Lu;0;L;<compat> 0398;;;;N;;;;03B8;
    //
    // Case-insensitive comparison should treat all of them as equivalent.
    //
    // But .toLowerCase() doesn't change ϑ (it's already lowercase),
    // and .toUpperCase() doesn't change ϴ (already uppercase).
    //
    // Applying first lower then upper case normalizes any character:
    // '\u0398\u03f4\u03b8\u03d1'.toLowerCase().toUpperCase() === '\u0398\u0398\u0398\u0398'
    //
    // Note: this is equivalent to unicode case folding; unicode normalization
    // is a different step that is not required here.
    //
    // Final result should be uppercased, because it's later stored in an object
    // (this avoid a conflict with Object.prototype members,
    // most notably, `__proto__`)
    //
    return str.toLowerCase().toUpperCase();
}
function isSpace(code) {
    switch (code) {
        case 0x09:
        case 0x20:
            return true;
    }
    return false;
}
function embedFactory(tag,attr,mores){
    return function (state, silent) {
        var attrs,
            code,
            content,
            label,
            labelEnd,
            labelStart,
            pos,
            ref,
            res,
            title,
            token,
            tokens,
            start,
            href = '',
            oldPos = state.pos,
            max = state.posMax;

        if (state.src.charCodeAt(state.pos) !== 0x40/* ! */) { return false; }
        if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

        labelStart = state.pos + 2;
        labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

        // parser failed to find ']', so it's not a valid link
        if (labelEnd < 0) { return false; }

        pos = labelEnd + 1;
        if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
            //
            // Inline link
            //

            // [link](  <href>  "title"  )
            //        ^^ skipping these spaces
            pos++;
            for (; pos < max; pos++) {
                code = state.src.charCodeAt(pos);
                if (!isSpace(code) && code !== 0x0A) { break; }
            }
            if (pos >= max) { return false; }

            // [link](  <href>  "title"  )
            //          ^^^^^^ parsing link destination
            start = pos;
            res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
            if (res.ok) {
                href = state.md.normalizeLink(res.str);
                if (state.md.validateLink(href)) {
                    pos = res.pos;
                } else {
                    href = '';
                }
            }

            // [link](  <href>  "title"  )
            //                ^^ skipping these spaces
            start = pos;
            for (; pos < max; pos++) {
                code = state.src.charCodeAt(pos);
                if (!isSpace(code) && code !== 0x0A) { break; }
            }

            // [link](  <href>  "title"  )
            //                  ^^^^^^^ parsing link title
            res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
            if (pos < max && start !== pos && res.ok) {
                title = res.str;
                pos = res.pos;

                // [link](  <href>  "title"  )
                //                         ^^ skipping these spaces
                for (; pos < max; pos++) {
                    code = state.src.charCodeAt(pos);
                    if (!isSpace(code) && code !== 0x0A) { break; }
                }
            } else {
                title = '';
            }

            if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
                state.pos = oldPos;
                return false;
            }
            pos++;
        } else {
            //
            // Link reference
            //
            if (typeof state.env.references === 'undefined') { return false; }

            if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
                start = pos + 1;
                pos = state.md.helpers.parseLinkLabel(state, pos);
                if (pos >= 0) {
                    label = state.src.slice(start, pos++);
                } else {
                    pos = labelEnd + 1;
                }
            } else {
                pos = labelEnd + 1;
            }

            // covers label === '' and label === undefined
            // (collapsed reference link and shortcut reference link respectively)
            if (!label) { label = state.src.slice(labelStart, labelEnd); }

            ref = state.env.references[normalizeReference(label)];
            if (!ref) {
                state.pos = oldPos;
                return false;
            }
            href = ref.href;
            title = ref.title;
        }

        //
        // We found the end of the link, and know for a fact it's a valid link;
        // so all that's left to do is to call tokenizer.
        //
        if (!silent) {
            // content = state.src.slice(labelStart, labelEnd);
            // state.md.inline.parse(
            //     content,
            //     state.md,
            //     state.env,
            //     tokens = []
            // );
            state.pos = labelStart;
            state.posMax = labelEnd;

            token          = state.push('embed_open', tag, 1);
            token.attrs    = attrs = [ [ attr, href ] ];
            // token.children = tokens;
            // token.content  = content;

            if (title) {
                attrs.push([ 'title', title ]);
            }
            if(mores && mores.length){
                mores.forEach(function(more){
                    attrs.push(more);
                })
            }
            state.md.inline.tokenize(state);
            token          = state.push('embed_close', tag, -1);
        }

        state.pos = pos;
        state.posMax = max;
        return true;
    };
}

export default function(tag,attr,mores) {
    let embed=embedFactory(tag,attr,mores);
    return function(md){
        md.inline.ruler.after('image', tag, embed)
    }
}
