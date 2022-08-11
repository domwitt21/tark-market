const Discord = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder  } = require("discord.js");
const client = new Discord.Client({intents: ["GuildMessages", "MessageContent", "GuildEmojisAndStickers", "Guilds"]});
const config = require("./auth.json");
const { request, gql } = require("graphql-request");

client.on("unhandledRejection", error => {
    console.error("Unhandled promise rejections", error);
});
client.on("shardError", error => {
    console.error("A websocket connection has encountered an error", error);
});
client.on("ready", () => {
    console.log("Tark Market is online");
});
client.setMaxListeners(20);
client.login(config.token);

//sends message to guild owner
client.on("guildCreate", async guild => {
    const owner = await guild.fetchOwner();
    const welcomeEmbed = new EmbedBuilder()
        .setColor("A79245")
        .setTitle("Thanks for the invite!")
        .setAuthor({ name: "Tark Market", iconURL: `${client.user.avatarURL()}` })
        .setDescription("I will be the only bot you'll ever need for Escape From Tarkov! Here's a list of commands to help you get started!\n\nThis bot doesn't require any role to use and doesn't come with any admin features.\n\nIf you have a private server, you might want to give the bot perms to communicate in your server.\n\n🆕 **Real-time updates**\n🔎 **Detailed information on any item**\n💨 **Quick results\n**")
        .addFields([
            {name: "**!t <item name>**", value: "```Get information on a certain item. Ex: !t Leatherman Multitool```"},
            {name: "**!t gunlist**", value: "```Get a list of all guns in Escape From Tarkov```"},
            {name: "**!t barter**", value: "```Get a list of all barter only items in Escape From Tarkov```"},
            {name: "**!t noflea**", value: "```Get a list of all items that can't be bought on the flea market in Escape From Tarkov```"},
            {name: "**!t armor**", value: "```Get a list of all armor in Escape From Tarkov```"},
            {name: "**!t ammo**", value: "```Get a list of all ammo in Escape From Tarkov```"},
            {name: "**!t backpack**", value: "```Get a list of all backpacks```"},
            {name: "**!t rigs**", value: "```Get a list of all rigs```"},
            {name: "**!t containers**", value: "```Get a list of all containers```"},
            {name: "**!t glasses**", value: "```Get a list of all glasses```"},
            {name: "**!t headphones**", value: "```Get a list of all headphones```"},
            {name: "**!t keys**", value: "```Get a list of all keys```"},
            {name: "**!t meds**", value: "```Get a list of all meds```"},
            {name: "**!t helmets**", value: "```Get a list of all helmets```"},
            {name: "**!t grenades**", value: "```Get a list of all grenades```"},
            {name: "**!t mods**", value: "```Get a list of all mods```"},
            {name: "**!t pistolGrips**", value: "```Get a list of all pistol grips```"},
            {name: "**!t suppressors**", value: "```Get a list of all suppressors```"},
            {name: "**!t provisions**", value: "```Get a list of all provisions```"},
            {name: "**!t injectors**", value: "```Get a list of all injectors```"},
        ])
    
    owner.user.send({embeds: [welcomeEmbed]});
    return;
});

// get help embed
client.on("messageCreate", message => {
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "help") {
            const helpEmbed = new EmbedBuilder()
                .setColor("A79245")
                .setTitle("Getting Started")
                .setAuthor({ name: "Tark Market", iconURL: `${client.user.avatarURL()}` })
                .setDescription("I will be the only bot you'll ever need for Escape From Tarkov! Here's a list of commands to help you get started!\n\n🆕 **Real-time updates**\n🔎 **Detailed information on any item**\n💨 **Quick results**\n\n")
                .addFields([
                    {name: "**!t <item name>**", value: "```Get information on a certain item. Ex: !t Leatherman Multitool```"},
                    {name: "**!t gunlist**", value: "```Get a list of all guns in Escape From Tarkov```"},
                    {name: "**!t barter**", value: "```Get a list of all barter only items in Escape From Tarkov```"},
                    {name: "**!t noflea**", value: "```Get a list of all items that can't be bought on the flea market in Escape From Tarkov```"},
                    {name: "**!t armor**", value: "```Get a list of all armor in Escape From Tarkov```"},
                    {name: "**!t ammo**", value: "```Get a list of all ammo in Escape From Tarkov```"},
                    {name: "**!t backpack**", value: "```Get a list of all backpacks```"},
                    {name: "**!t rigs**", value: "```Get a list of all rigs```"},
                    {name: "**!t containers**", value: "```Get a list of all containers```"},
                    {name: "**!t glasses**", value: "```Get a list of all glasses```"},
                    {name: "**!t headphones**", value: "```Get a list of all headphones```"},
                    {name: "**!t keys**", value: "```Get a list of all keys```"},
                    {name: "**!t meds**", value: "```Get a list of all meds```"},
                    {name: "**!t helmets**", value: "```Get a list of all helmets```"},
                    {name: "**!t grenades**", value: "```Get a list of all grenades```"},
                    {name: "**!t mods**", value: "```Get a list of all mods```"},
                    {name: "**!t pistolGrips**", value: "```Get a list of all pistol grips```"},
                    {name: "**!t suppressors**", value: "```Get a list of all suppressors```"},
                    {name: "**!t provisions**", value: "```Get a list of all provisions```"},
                    {name: "**!t injectors**", value: "```Get a list of all injectors```"},
                ])
            message.channel.send({ embeds: [helpEmbed] });
            return;
        };
    };
});

// get list of all weapons
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "gunlist") {
            const query = gql`
            {
                items(type: gun) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 50).toString();
                const gunListMain = mainArgs.replaceAll(",", "\n\n");
                const mainArgsTwo = allItems.slice(51, 116).toString();
                const gunListMainTwo = mainArgsTwo.replaceAll(",", "\n\n");
                const nextButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1234")
                            .setLabel("Page 1/2")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const weaponEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Weapons")
                    .setDescription(`***Total Number of weapons: ${allItems.length}***\n***Weapons on page: 50***\n\nIf you want specific information on a gun, use the command with the gun name!(ex: !t Colt M4A1 5.56x45 assault rifle)\n\n${gunListMain}`)

                const previousButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("5566")
                            .setLabel("Page 2/2")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const weaponEmbedTwo = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Weapons")
                    .setDescription(`***Total Number of weapons: ${allItems.length}***\n***Weapons on page: 65***\n\nIf you want specific information on a gun, use the command with the gun name!(ex: !t Colt M4A1 5.56x45 assault rifle)\n\n${gunListMainTwo}`)

                message.channel.send({embeds: [weaponEmbed], components: [nextButton]})
                    .then((msg) => {
                        const collector = msg.channel.createMessageComponentCollector();
                        collector.on("collect", collection => {
                            if(collection.customId === "1234") {
                                collection.update({embeds: [weaponEmbedTwo], components: [previousButton]})
                                return;
                            } else if(collection.customId === "5566") {
                                collection.update({embeds: [weaponEmbed], components: [nextButton]})
                                return;
                            };
                        });
                    })
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all ammo
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "ammo") {
            const query = gql`
            {
                items(type: ammo) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                console.log(allItems.length)
                const mainArgs = allItems.slice(0, 58).toString();
                const ammoList = mainArgs.replaceAll(",", "\n");
                const mainArgsTwo = allItems.slice(58, 114).toString();
                const ammoListTwo = mainArgsTwo.replaceAll(",", "\n");
                const mainArgsThree = allItems.slice(114, 170).toString();
                const ammoListThree = mainArgsThree.replaceAll(",", "\n");
                const nextButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("Next 1/3")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    
                const pageNext = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("Prev 2/3")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("again")
                            .setLabel("Next 2/3")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const lastNext = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("last")
                            .setLabel("Prev 3/3")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const ammoEmbed = {
                    color: 0xA79245,
                    title: "Ammo",
                    description: `***Total Number of ammo types: ${allItems.length}***\n***Ammo types on page: 58***\nIf you want specific information on an ammo type, use the command with the ammo name!(ex: !t 5.45x39mm HP)\n\n${ammoList}`,
                };
                const ammoEmbedTwo = {
                    color: 0xA79245,
                    title: "Ammo",
                    description: `***Total Number of ammo types: ${allItems.length}***\n***Ammo types on page: 58***\n\n${ammoListTwo}`,
                };
                const ammoEmbedThree = {
                    color: 0xA79245,
                    title: "Ammo",
                    description: `***Total Number of ammo types: ${allItems.length}***\n***Ammo types on page: 58***\n\n${ammoListThree}`,
                };
                message.channel.send({embeds: [ammoEmbed], components: [nextButton]})
                    .then((msg) => {
                        const collector = msg.channel.createMessageComponentCollector();
                        collector.on("collect", collection => {
                            if(collection.customId === "next") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]})
                                return;
                            } else if(collection.customId === "last") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]});
                                return;
                            } else if(collection.customId === "prev") {
                                collection.update({embeds: [ammoEmbed], components: [nextButton]})
                                return;
                            } else if(collection.customId === "again") {
                                collection.update({embeds: [ammoEmbedThree], components: [lastNext]})
                                return;
                            } else {
                                return;
                            };
                        });
                    })
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// find any item
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "gunlist" || args[1] === "ammo" || args[1] === "help") return;
        if(args[1] === "barter" || args[1] === "rigs" || args[1] === "armor") return;
        if(args[1] === "backpacks" || args[1] === "containers" || args[1] === "glasses") return;
        if(args[1] === "headphones" || args[1] === "keys" || args[1] === "meds") return;
        if(args[1] === "helmets" || args[1] === "grenades" || args[1] === "mods") return;
        if(args[1] === "pistolGrips" || args[1] === "suppressors" || args[1] === "provisions") return;
        if(args[1] === "injectors") return;
        const query = gql`
        {
            items(names: "${message.content.slice(3)}") {
                name
                basePrice
                shortName
                iconLink
                sellFor {
                    currency
                    price
                    vendor {
                        name
                    }
                }
                buyFor {
                    currency
                    price
                    vendor {
                        name
                    }
                }
                usedInTasks {
                    name
                    map {
                      name
                    }
                }
                bartersFor {
                    level
                    taskUnlock {
                      name
                    }
                    trader {
                      name
                    }
                    requiredItems {
                      item {
                        name
                      }
                      quantity
                    }
                }
                craftsUsing{
                    station {
                      name
                    }
                  }
                weight
            }
        }`
        const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
            const currency = data.items[0].buyFor.map(i => i.currency).toString().replaceAll(",", ",   ");
            const vendor = data.items[0].buyFor.map(i => i.vendor.name).toString().replaceAll(",", ",   ");
            const price = data.items[0].buyFor.map(i => i.price).toString().replaceAll(",", ",   ");
            const sellCurrency = data.items[0].sellFor.map(i => i.currency).toString().replaceAll(",", ",   ");
            const sellVendor = data.items[0].sellFor.map(i => i.vendor.name).toString().replaceAll(",", ",   ");
            const sellPrice = data.items[0].sellFor.map(i => i.price).toString().replaceAll(",", ",   ");
            const taskName = data.items[0].usedInTasks.map(i => i.name).toString().replaceAll(",", "\n");
            const barterLevel = data.items[0].bartersFor.map(i => i.level).toString().replaceAll(",", ",  ");
            const barterTrader = data.items[0].bartersFor.map(i => i.trader.name).toString().replaceAll(",", ",  ");
            const craftsStation = data.items[0].craftsUsing.map(i => i.station.name).toString().replaceAll(",", ",  ");
            const itemEmbed = {
                color: 0xA79245,
                title: `${data.items[0].name}`,
                description: "If an item's value is null, it could be because the item is categorized as noFlea or as a barter item.\n\n**(All item value's are listed in order. First price goes with first vendor, etc.)**",
                image: {
                    url: data.items[0].iconLink,
                },
                fields: [
                    {
                        name: "__Buy item for__",
                        value: `**Vendors**: ${vendor}\n**Currencys**: ${currency}\n**Prices**: ${price}` || "Not available",
                    },
                    {
                        name: "__Sell item for__",
                        value: `**Vendors**: ${sellVendor}\n**Currencys**: ${sellCurrency}\n**Prices**: ${sellPrice}` || "Not available",
                    },
                    {
                        name: "__Tasks used in__",
                        value: `${taskName}` || "Not available",
                    },
                    {
                        name: "__Barter trader and level__",
                        value: `**Trader**: ${barterTrader}\n**Level**: ${barterLevel}` || "Not available",
                    },
                    {
                        name: "__Stations can be crafted at__",
                        value: `${craftsStation}` || "Not available",
                    },
                    {
                        name: "__Weight__",
                        value: `**${data.items[0].weight}KG**` || "Not available",
                    },
                ],
            };
            message.channel.send({embeds: [itemEmbed]});
            return;
        })
            .catch((error) => console.log(error));
        return;
    };
});

// list all barter items
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "barter") {
            const query = gql`
            {
                items(type: barter) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 50).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const mainArgsTwo = allItems.slice(50, 100).toString();
                const ammoListTwo = mainArgsTwo.replaceAll(",", "\n\n");
                const mainArgsThree = allItems.slice(100, 150).toString();
                const ammoListThree = mainArgsThree.replaceAll(",", "\n\n");
                const mainArgsFour = allItems.slice(150, 203).toString();
                const ammoListFour = mainArgsFour.replaceAll(",", "\n\n");
                const nextButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1778")
                            .setLabel("Next 1/4")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    
                const pageNext = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("7878")
                            .setLabel("Prev 2/4")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1123")
                            .setLabel("Next 2/4")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const lastNext = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("4323")
                            .setLabel("Prev 4/4")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fourLastPrev = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("5577")
                            .setLabel("Prev 3/4")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("6575")
                            .setLabel("Next 3/4")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of barter items: ${allItems.length}***\n***Barter items on page: 50***\n\nIf you want specific information on a barter item, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                const ammoEmbedTwo = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of barter items: ${allItems.length}***\n***Barter items on page: 50***\n\nIf you want specific information on a barter item, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListTwo}`)
                  
                const ammoEmbedThree = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of barter items: ${allItems.length}***\n***Barter items on page: 50***\n\nIf you want specific information on a barter item, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListThree}`)

                const ammoEmbedFour = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of barter items: ${allItems.length}***\n***Barter items on page: 53***\n\nIf you want specific information on a barter item, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListFour}`)
                
                message.channel.send({embeds: [ammoEmbed], components: [nextButton]})
                    .then((msg) => {
                        const collector = msg.channel.createMessageComponentCollector();
                        collector.on("collect", collection => {
                            if(collection.customId === "1778") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]})
                                return;
                            } else if(collection.customId === "1123") {
                                collection.update({embeds: [ammoEmbedThree], components: [fourLastPrev]});
                                return;
                            } else if(collection.customId === "4323") {
                                collection.update({embeds: [ammoEmbedThree], components: [fourLastPrev]})
                                return;
                            } else if(collection.customId === "7878") {
                                collection.update({embeds: [ammoEmbed], components: [nextButton]})
                                return;
                            } else if(collection.customId === "6575") {
                                collection.update({embeds: [ammoEmbedFour], components: [lastNext]})
                                return;
                            } else if(collection.customId === "5577") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]})
                                return;
                            } else {
                                return;
                            };
                        });
                    })
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all rigs
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "rigs") {
            const query = gql`
            {
                items(type: rig) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                console.log(allItems.length);
                const mainArgs = allItems.slice(0, 47).toString();
                const rigsList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Tactical Rigs")
                    .setDescription(`***Total Number of rigs: ${allItems.length}***\n***Rigs listed on page: 47***\n\nIf you want specific information on a rig, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${rigsList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all backpacks
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "backpacks") {
            const query = gql`
            {
                items(type: backpack) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 33).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of backpacks: ${allItems.length}***\n***Backpacks on page: 33***\n\nIf you want specific information on a backpack, use the command with the backpack name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all containers
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "containers") {
            const query = gql`
            {
                items(type: container) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 21).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Containers")
                    .setDescription(`***Total Number of containers: ${allItems.length}***\n***Containers on page: 27***\n\nIf you want specific information on a container, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all glasses
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "glasses") {
            const query = gql`
            {
                items(type: glasses) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 30).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Glasses")
                    .setDescription(`***Total Number of glasses: ${allItems.length}***\n***Glasses on page: 30***\n\nIf you want specific information on a pair of glasses, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all headphones
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "headphones") {
            const query = gql`
            {
                items(type: headphones) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 9).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Barter Items")
                    .setDescription(`***Total Number of headphones: ${allItems.length}***\n***headphones on page: 9***\n\nIf you want specific information on a pair of headphones, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.log(err));
                return;
            });
        };
    };
});

// list all barter items
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "keys") {
            const query = gql`
            {
                items(type: keys) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 50).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const mainArgsTwo = allItems.slice(50, 100).toString();
                const ammoListTwo = mainArgsTwo.replaceAll(",", "\n\n");
                const mainArgsThree = allItems.slice(100, 155).toString();
                const ammoListThree = mainArgsThree.replaceAll(",", "\n\n");
                const nextButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("9488")
                            .setLabel("Next 1/3")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    
                const pageNext = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1111")
                            .setLabel("Prev 2/3")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1120")
                            .setLabel("Next 2/3")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fourLastPrev = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1244")
                            .setLabel("Prev 3/3")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Keys")
                    .setDescription(`***Total Number of Keys: ${allItems.length}***\n***Keys on page: 50***\n\nIf you want specific information on a key, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                const ammoEmbedTwo = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Keys")
                    .setDescription(`***Total Number of Keys: ${allItems.length}***\n***Keys on page: 50***\n\nIf you want specific information on a key, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListTwo}`)
                  
                const ammoEmbedThree = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Keys")
                    .setDescription(`***Total Number of Keys: ${allItems.length}***\n***Keys on page: 55***\n\nIf you want specific information on a key, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListThree}`)

                message.channel.send({embeds: [ammoEmbed], components: [nextButton]})
                    .then((msg) => {
                        const collector = msg.channel.createMessageComponentCollector();
                        collector.on("collect", collection => {
                            if(collection.customId === "9488") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]})
                                return;
                            } else if(collection.customId === "1120") {
                                collection.update({embeds: [ammoEmbedThree], components: [fourLastPrev]})
                                return;
                            } else if(collection.customId === "1111") {
                                collection.update({embeds: [ammoEmbed], components: [nextButton]})
                                return;
                            } else if(collection.customId === "1244") {
                                collection.update({embeds: [ammoEmbedTwo], components: [pageNext]})
                                return;
                            } else {
                                return;
                            };
                        });
                    })
                    .catch((err) => console.log(err));
                    return;
                return;
            });
        };
    };
});

// list all medical items
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "meds") {
            const query = gql`
            {
                items(type: meds) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 37).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Meds")
                    .setDescription(`***Total Number of meds: ${allItems.length}***\n***Meds on page: 37***\n\nIf you want specific information on a med, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all helmets
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "helmets") {
            const query = gql`
            {
                items(type: helmet) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 40).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Helmets")
                    .setDescription(`***Total Number of helmets: ${allItems.length}***\n***Helmets on page: 40***\n\nIf you want specific information on a helmet, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all grenades
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "grenades") {
            const query = gql`
            {
                items(type: grenade) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 11).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Grenades")
                    .setDescription(`***Total Number of grenades: ${allItems.length}***\n***Grenades on page: 11***\n\nIf you want specific information on a grenade, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all injectors
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "injectors") {
            const query = gql`
            {
                items(type: injectors) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 16).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Injectors")
                    .setDescription(`***Total Number of injectors: ${allItems.length}***\n***Injectors on page: 16***\n\nIf you want specific information on an injector, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all provisions
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "provisions") {
            const query = gql`
            {
                items(type: provisions) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 74).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Provisions")
                    .setDescription(`***Total Number of provisions: ${allItems.length}***\n***Provisions on page: 74***\n\nIf you want specific information on any provisions, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all suppressors
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "suppressors") {
            const query = gql`
            {
                items(type: suppressor) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 59).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Suppressors")
                    .setDescription(`***Total Number of suppressors: ${allItems.length}***\n***Suppressors on page: 59***\n\nIf you want specific information on any suppressor, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all pistol grips
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "pistolGrips") {
            const query = gql`
            {
                items(type: pistolGrip) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 96).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Pistol Grips")
                    .setDescription(`***Total Number of pistol grips: ${allItems.length}***\n***Pistol grips on page: 96***\n\nIf you want specific information on any pistol grip, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                message.channel.send({embeds: [ammoEmbed]})
                    .catch((err) => console.error(err));
                return;
            });
        };
    };
});

// list all mods
client.on("messageCreate", message => {
    if(message.author.bot) return;
    const args = message.content.trim().split(/ +/g);
    if(args[0] === "!t") {
        if(args[1] === "mods") {
            const query = gql`
            {
                items(type: mods) {
                    name
                }
            }`
            const getInfo = request("https://api.tarkov.dev/graphql", query).then((data) => {
                const allItems = data.items.map(i => i.name);
                const mainArgs = allItems.slice(0, 100).toString();
                const ammoList = mainArgs.replaceAll(",", "\n\n");
                const mainArgsTwo = allItems.slice(100, 200).toString();
                const ammoListTwo = mainArgsTwo.replaceAll(",", "\n\n");
                const mainArgsFour = allItems.slice(200, 300).toString();
                const ammoListFour = mainArgsFour.replaceAll(",", "\n\n");
                const mainArgsFive = allItems.slice(300, 400).toString();
                const ammoListFive = mainArgsFive.replaceAll(",", "\n\n");
                const mainArgsSix = allItems.slice(400, 500).toString();
                const ammoListSix = mainArgsSix.replaceAll(",", "\n\n");
                const mainArgsSeven = allItems.slice(500, 600).toString();
                const ammoListSeven = mainArgsSeven.replaceAll(",", "\n\n");
                const mainArgsEight = allItems.slice(600, 700).toString();
                const ammoListEight = mainArgsEight.replaceAll(",", "\n\n");
                const mainArgsNine = allItems.slice(700, 800).toString();
                const ammoListNine = mainArgsNine.replaceAll(",", "\n\n");
                const mainArgsTen = allItems.slice(800, 900).toString();
                const ammoListTen = mainArgsTen.replaceAll(",", "\n\n");
                const mainArgsThirteen = allItems.slice(900, 1000).toString();
                const ammoListThirteen = mainArgsThirteen.replaceAll(",", "\n\n");
                const mainArgsFourteen = allItems.slice(1000, 1100).toString();
                const ammoListFourteen = mainArgsFourteen.replaceAll(",", "\n\n");
                const mainArgsFifteen = allItems.slice(1100, 1200).toString();
                const ammoListFifteen = mainArgsFifteen.replaceAll(",", "\n\n");
                const mainArgsSixteen = allItems.slice(1200, 1300).toString();
                const ammoListSixteen = mainArgsSixteen.replaceAll(",", "\n\n");
                const mainArgsSeventeen = allItems.slice(1300, 1400).toString();
                const ammoListSeventeen = mainArgsSeventeen.replaceAll(",", "\n\n");
                const mainArgsEighteen = allItems.slice(1400, 1500).toString();
                const ammoListEighteen = mainArgsEighteen.replaceAll(",", "\n\n");
                const mainArgsNineteen = allItems.slice(1500, 1522).toString();
                const ammoListNineteen = mainArgsNineteen.replaceAll(",", "\n\n");
                const secondEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("9788")
                            .setLabel("Next 1/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const thirdEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1886")
                            .setLabel("Prev 2/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("6818")
                            .setLabel("Next 2/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fourthEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1300")
                            .setLabel("Prev 3/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("0013")
                            .setLabel("Next 3/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fifthEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1546")
                            .setLabel("Prev 4/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("4615")
                            .setLabel("Next 4/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const sixthEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1787")
                            .setLabel("Prev 5/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1987")
                            .setLabel("Next 5/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const seventhEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1977")
                            .setLabel("Prev 6/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1797")
                            .setLabel("Next 6/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const eighthEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("7747")
                            .setLabel("Prev 7/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("4777")
                            .setLabel("Next 7/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const ninethEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("9788")
                            .setLabel("Prev 8/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("8879")
                            .setLabel("Next 8/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const tenthEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("2255")
                            .setLabel("Prev 9/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("5522")
                            .setLabel("Next 9/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const thirteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("8474")
                            .setLabel("Prev 10/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("7448")
                            .setLabel("Next 10/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fourteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("6544")
                            .setLabel("Prev 11/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("4456")
                            .setLabel("Next 11/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const fifteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("7090")
                            .setLabel("Prev 12/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("9070")
                            .setLabel("Next 12/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const sixteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1223")
                            .setLabel("Prev 13/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("2231")
                            .setLabel("Next 13/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const seventeenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("3030")
                            .setLabel("Prev 14/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("0303")
                            .setLabel("Next 14/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const eighteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("0101")
                            .setLabel("Prev 15/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("1010")
                            .setLabel("Next 15/16")
                            .setEmoji("⏭️")
                            .setStyle(ButtonStyle.Secondary)
                    )

                const nineteenEmbed = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("9999")
                            .setLabel("Prev 16/16")
                            .setEmoji("⏮️")
                            .setStyle(ButtonStyle.Secondary)
                    )
                
                const ammoEmbed = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoList}`)
                
                const ammoEmbedThree = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListTwo}`)

                const ammoEmbedFour = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListFour}`)
                
                const ammoEmbedFive = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListFive}`)
                  
                const ammoEmbedSix = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListSix}`)

                const ammoEmbedSeven = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListSeven}`)
                
                const ammoEmbedEight = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListEight}`)
                  
                const ammoEmbedNine = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListNine}`)

                const ammoEmbedTen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListTen}`)
                
                const ammoEmbedThirteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListThirteen}`)
                  
                const ammoEmbedFourteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListFourteen}`)

                const ammoEmbedFifteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListFifteen}`)
                  
                const ammoEmbedSixteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListSixteen}`)

                const ammoEmbedSeventeen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListSeventeen}`)
                
                const ammoEmbedEighteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 100***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListEighteen}`)
                  
                const ammoEmbedNineteen = new EmbedBuilder()
                    .setColor("A79245")
                    .setTitle("Mods")
                    .setDescription(`***Total Number of Mods: ${allItems.length}***\n***Mods on page: 22***\n\nIf you want specific information on a mod, use the command with the item name!(ex: !t Leatherman Multitool)\n\n${ammoListNineteen}`)

                message.channel.send({embeds: [ammoEmbed], components: [secondEmbed]})
                    .then((msg) => {
                        const collector = msg.channel.createMessageComponentCollector();
                        collector.on("collect", collection => {
                            if(collection.customId === "9788") {
                                collection.update({embeds: [ammoEmbedThree], components: [thirdEmbed]})
                                return;
                            } else if(collection.customId === "1886") {
                                collection.update({embeds: [ammoEmbed], components: [secondEmbed]})
                                return;
                            } else if(collection.customId === "6818") {
                                collection.update({embeds: [ammoEmbedFour], components: [fourthEmbed]})
                                return;
                            } else if(collection.customId === "1300") {
                                collection.update({embeds: [ammoEmbedThree], components: [thirdEmbed]})
                                return;
                            } else if(collection.customId === "0013") {
                                collection.update({embeds: [ammoEmbedFive], components: [fifthEmbed]})
                                return;
                            } else if(collection.customId === "1546") {
                                collection.update({embeds: [ammoEmbedFour], components: [fourthEmbed]})
                                return;
                            } else if(collection.customId === "4615") {
                                collection.update({embeds: [ammoEmbedSix], components: [sixthEmbed]})
                                return;
                            } else if(collection.customId === "1787") {
                                collection.update({embeds: [ammoEmbedFive], components: [fifthEmbed]})
                                return;
                            } else if(collection.customId === "1987") {
                                collection.update({embeds: [ammoEmbedSeven], components: [seventhEmbed]})
                                return;
                            } else if(collection.customId === "1977") {
                                collection.update({embeds: [ammoEmbedSix], components: [sixthEmbed]})
                                return;
                            } else if(collection.customId === "1797") {
                                collection.update({embeds: [ammoEmbedEight], components: [eighthEmbed]})
                                return;
                            } else if(collection.customId === "7747") {
                                collection.update({embeds: [ammoEmbedSeven], components: [seventhEmbed]})
                                return;
                            } else if(collection.customId === "4777") {
                                collection.update({embeds: [ammoEmbedNine], components: [ninethEmbed]})
                                return;
                            } else if(collection.customId === "9788") {
                                collection.update({embeds: [ammoEmbedEight], components: [eighthEmbed]})
                                return;
                            } else if(collection.customId === "8879") {
                                collection.update({embeds: [ammoEmbedTen], components: [tenthEmbed]})
                                return;
                            } else if(collection.customId === "2255") {
                                collection.update({embeds: [ammoEmbedNine], components: [ninethEmbed]})
                                return;
                            } else if(collection.customId === "5522") {
                                collection.update({embeds: [ammoEmbedThirteen], components: [thirteenEmbed]})
                                return;
                            } else if(collection.customId === "8474") {
                                collection.update({embeds: [ammoEmbedTen], components: [tenthEmbed]})
                                return;
                            } else if(collection.customId === "7448") {
                                collection.update({embeds: [ammoEmbedFourteen], components: [fourteenEmbed]})
                                return;
                            } else if(collection.customId === "6544") {
                                collection.update({embeds: [ammoEmbedThirteen], components: [thirteenEmbed]})
                                return;
                            } else if(collection.customId === "4456") {
                                collection.update({embeds: [ammoEmbedFifteen], components: [fifteenEmbed]})
                                return;
                            } else if(collection.customId === "7090") {
                                collection.update({embeds: [ammoEmbedFourteen], components: [fourteenEmbed]})
                                return;
                            } else if(collection.customId === "9070") {
                                collection.update({embeds: [ammoEmbedSixteen], components: [sixteenEmbed]})
                                return;
                            } else if(collection.customId === "1223") {
                                collection.update({embeds: [ammoEmbedFifteen], components: [fifteenEmbed]})
                                return;
                            } else if(collection.customId === "2231") {
                                collection.update({embeds: [ammoEmbedSeventeen], components: [seventeenEmbed]})
                                return;
                            } else if(collection.customId === "3030") {
                                collection.update({embeds: [ammoEmbedSixteen], components: [sixteenEmbed]})
                                return;
                            } else if(collection.customId === "0303") {
                                collection.update({embeds: [ammoEmbedEighteen], components: [eighteenEmbed]})
                                return;
                            } else if(collection.customId === "0101") {
                                collection.update({embeds: [ammoEmbedSeventeen], components: [seventeenEmbed]})
                                return;
                            } else if(collection.customId === "1010") {
                                collection.update({embeds: [ammoEmbedNineteen], components: [nineteenEmbed]})
                                return;
                            } else if(collection.customId === "9999") {
                                collection.update({embeds: [ammoEmbedEighteen], components: [eighteenEmbed]})
                                return;
                            } else {
                                return;
                            }
                        });
                    })
                    .catch((err) => console.log(err));
                    return;
                return;
            });
        };
    };
});