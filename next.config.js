/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins");
const withPWA = require("next-pwa");


const nextConfig = {
	reactStrictMode: true,
  images: {
    loader: "imgix",
    path: "/",
  },
};

module.exports = withPlugins(
	[
		[
			withPWA,
			{
				pwa: {
					dest: "public",
				},
			},
		],
	],
  nextConfig
);

/*
module.exports = {
  reactStrictMode: true,
  images: {
    loader: "imgix",
    path: "/",
  },
  
};
*/
