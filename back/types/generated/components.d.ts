import type { Schema, Struct } from '@strapi/strapi';

export interface DecorativeLine extends Struct.ComponentSchema {
  collectionName: 'components_decorative_lines';
  info: {
    displayName: 'Line';
    icon: 'oneToOne';
  };
  attributes: {
    Container: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Indentations: Schema.Attribute.String;
    OnOff: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface ImgIcon extends Struct.ComponentSchema {
  collectionName: 'components_img_icons';
  info: {
    displayName: 'Icon';
    icon: 'landscape';
  };
  attributes: {
    Link: Schema.Attribute.String;
    SingleIcon: Schema.Attribute.Media<'images'>;
    SingleIconText: Schema.Attribute.String;
  };
}

export interface ImgImg extends Struct.ComponentSchema {
  collectionName: 'components_img_imgs';
  info: {
    displayName: 'Img';
    icon: 'landscape';
  };
  attributes: {
    Box: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Container: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ImageName: Schema.Attribute.String;
    Img: Schema.Attribute.Media<'images'>;
    Indent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface InteractivityCasesCarousel extends Struct.ComponentSchema {
  collectionName: 'components_interactivity_cases_carousels';
  info: {
    displayName: 'CasesCarousel';
    icon: 'apps';
  };
  attributes: {
    OnOff: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Service: Schema.Attribute.Enumeration<
      [
        '\u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430',
        '\u043F\u043E\u043B\u0438\u0433\u0440\u0430\u0444\u0438\u044F',
      ]
    >;
  };
}

export interface InteractivityFeaturedPosts extends Struct.ComponentSchema {
  collectionName: 'components_interactivity_featured_posts';
  info: {
    displayName: 'FeaturedPosts';
    icon: 'apps';
  };
  attributes: {
    FeaturedPosts: Schema.Attribute.Boolean;
  };
}

export interface LayoutColumn extends Struct.ComponentSchema {
  collectionName: 'components_layout_columns';
  info: {
    displayName: 'Column';
    icon: 'apps';
  };
  attributes: {
    Align: Schema.Attribute.Enumeration<['start', 'end', 'center', 'stretch']>;
    Direction: Schema.Attribute.Enumeration<['column', 'row']>;
    Heading: Schema.Attribute.Component<'text.heading', true>;
    Icon: Schema.Attribute.Component<'img.icon', true>;
    Img: Schema.Attribute.Component<'img.img', true>;
    Justify: Schema.Attribute.Enumeration<
      ['start', 'end', 'center', 'between']
    >;
    MobWidth: Schema.Attribute.Enumeration<
      [
        'w-1-4',
        'w-1-3',
        'w-1-2',
        'w-2-3',
        'w-3-4',
        'w-1-1',
        'w-fit',
        'w-min',
        'w-max',
      ]
    >;
    Paragraph: Schema.Attribute.Component<'text.paragraph', true>;
    Width: Schema.Attribute.Enumeration<
      [
        'w-1-4',
        'w-1-3',
        'w-1-2',
        'w-2-3',
        'w-3-4',
        'w-1-1',
        'w-fit',
        'w-min',
        'w-max',
      ]
    >;
  };
}

export interface LayoutGrid extends Struct.ComponentSchema {
  collectionName: 'components_layout_grids';
  info: {
    displayName: 'Grid';
    icon: 'apps';
  };
  attributes: {
    BlockName: Schema.Attribute.String;
    Columns: Schema.Attribute.Component<'layout.column', true>;
    Container: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Gap: Schema.Attribute.Integer;
    Indent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    MobWrap: Schema.Attribute.Boolean;
    Wrap: Schema.Attribute.Boolean;
  };
}

export interface LinksEmail extends Struct.ComponentSchema {
  collectionName: 'components_links_emails';
  info: {
    displayName: 'Email';
    icon: 'envelop';
  };
  attributes: {
    Email: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'welcome@adel.pro'>;
    EmailLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'mailto:welcome@adel.pro'>;
  };
}

export interface LinksTel extends Struct.ComponentSchema {
  collectionName: 'components_links_tels';
  info: {
    displayName: 'Tel';
    icon: 'link';
  };
  attributes: {
    link: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'tel:+74993466635'>;
    Tel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'8-499-346-66-35'>;
  };
}

export interface MenuMenuItems extends Struct.ComponentSchema {
  collectionName: 'components_menu_menu_items';
  info: {
    displayName: 'MenuItems';
    icon: 'book';
  };
  attributes: {
    MenuItem: Schema.Attribute.String & Schema.Attribute.Required;
    Order: Schema.Attribute.Integer;
    Url: Schema.Attribute.String;
  };
}

export interface TextBlockquote extends Struct.ComponentSchema {
  collectionName: 'components_text_blockquotes';
  info: {
    displayName: 'Blockquote';
    icon: 'brush';
  };
  attributes: {
    BlockquoteSubtext: Schema.Attribute.Text;
    BlockquoteText: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface TextHeading extends Struct.ComponentSchema {
  collectionName: 'components_text_headings';
  info: {
    displayName: 'Heading';
    icon: 'book';
  };
  attributes: {
    Heading: Schema.Attribute.String;
    headinglevel: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    > &
      Schema.Attribute.DefaultTo<'h3'>;
  };
}

export interface TextParagraph extends Struct.ComponentSchema {
  collectionName: 'components_text_paragraphs';
  info: {
    displayName: 'Paragraph';
    icon: 'layer';
  };
  attributes: {
    BlockName: Schema.Attribute.String;
    Container: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Indent: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Paragraph: Schema.Attribute.RichText;
  };
}

export interface TextTitle extends Struct.ComponentSchema {
  collectionName: 'components_text_titles';
  info: {
    displayName: 'Title';
    icon: 'bold';
  };
  attributes: {
    OnOff: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    Title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'decorative.line': DecorativeLine;
      'img.icon': ImgIcon;
      'img.img': ImgImg;
      'interactivity.cases-carousel': InteractivityCasesCarousel;
      'interactivity.featured-posts': InteractivityFeaturedPosts;
      'layout.column': LayoutColumn;
      'layout.grid': LayoutGrid;
      'links.email': LinksEmail;
      'links.tel': LinksTel;
      'menu.menu-items': MenuMenuItems;
      'text.blockquote': TextBlockquote;
      'text.heading': TextHeading;
      'text.paragraph': TextParagraph;
      'text.title': TextTitle;
    }
  }
}
