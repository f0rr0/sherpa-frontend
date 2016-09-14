const type = {
    headline: "TSTAR-bold",
    bodyCopy:"Akkurat"
}

const size = {
    h1: 38,
    h2: 34,
    h3: 30,
    h4: 26,
    h5: 20,
    h6: 19,
    regular: 17,
    medium: 14,
    small: 12,
    tiny: 11,
    button:11,
    input:12
}

const letterSpacing={
    small:1,
    medium:2,
    large:4
}

const style = {
    h1: {
        fontFamily: type.headline,
        fontSize: size.h1
    },
    h2: {
        fontFamily: type.headline,
        fontSize: size.h2
    },
    h3: {
        fontFamily: type.headline,
        fontSize: size.h3
    },
    h4: {
        fontFamily: type.headline,
        fontSize: size.h4
    },
    h5: {
        fontFamily: type.headline,
        fontSize: size.h5
    },
    h6: {
        fontFamily: type.headline,
        fontSize: size.h6
    },
    normal: {
        fontFamily: type.headline,
        fontSize: size.regular
    },
    description: {
        fontFamily: type.headline,
        fontSize: size.medium
    }
};

export default {
    type,
    size,
    style,
    letterSpacing
}

