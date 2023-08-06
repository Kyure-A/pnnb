type Embed = {
    name: string
    value: string
    inline: boolean
}

type Embeds = {
    title: string
    url
    fields: Embed[]
}

type DiscordMessage = {
    embeds: Embeds
}
