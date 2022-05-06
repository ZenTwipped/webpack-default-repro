import DefinePlugin from 'webpack/lib/DefinePlugin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import ModuleFederationPlugin from 'webpack/lib/container/ModuleFederationPlugin.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { dependencies } = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

const IS_PROD = process.env.NODE_ENV === 'production';

export default function webpackConfig () {
  return {
    mode: IS_PROD ? 'production' : 'development',
    performance: false,

    devtool: 'cheap-module-source-map',

    devServer: {
      hot: true,
      open: true,
      port: 8080,
    },

    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: path.resolve(__dirname, './src/entry.js'),

    output: {
      path: path.resolve(__dirname, './dist'),
      pathinfo: true,
      filename: 'js/entry.js',
      chunkFilename: 'js/[name].chunk.[hash]js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
    },

    module: {
      strictExportPresence: true,

      rules: [

        { oneOf: [
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: path.resolve(__dirname, './src'),
            loader: 'babel-loader',
            options: {
              sourceMaps: true,
              inputSourceMap: true,
            },
          },

          // Process any JS outside of the app with Babel.
          // Unlike the application JS, we only compile the standard ES features.
          {
            test: /\.(js|mjs)$/,
            exclude: /@babel(?:\/|\\{1,2})runtime/,
            loader: 'babel-loader',
            options: {
              sourceMaps: true,
              inputSourceMap: true,
            },
          },

          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [ /^$/, /\.(js|cjs|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/ ],
            type: 'asset/resource',
          },

        ] },
      ],
    },

    resolve: {
      modules: [ 'node_modules', path.resolve(__dirname, '/node_modules') ],

      extensions: [
        '.js',
        '.mjs',
        '.cjs',
        '.json',
      ],
    },

    plugins: [

      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(IS_PROD ? 'production' : 'development'),
      }),

      new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(__dirname, './index.html'),
      }),

      new ModuleFederationPlugin({
        name: 'webpack-default-repro',
        filename: 'remoteEntry.js',
        remotes: {},
        exposes: {},
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies.react,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: dependencies['react-dom'],
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: dependencies['react-router-dom'],
          },
        },
      }),
    ],

  };
}
