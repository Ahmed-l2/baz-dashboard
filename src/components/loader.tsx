import i18n from "../i18n";





export const Loader = () =>{
    const isRTL = i18n.language === 'ar';
return(
      <div className={` ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center min-h-screen">
          <img  src='./assets/logo/baz-logo-nobg.svg' className=' w-1/4 opacity-5 animate-pulse  h-auto'/>
        </div>
      </div>

)
}